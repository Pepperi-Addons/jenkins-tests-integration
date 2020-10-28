import { Client, Request } from '@pepperi-addons/debug-server';
import GeneralService from './services/general.service';
import tester from './tester';

type AuditStatus = 'Success' | 'Failure' | 'InProgress' | 'InRetry';
const apiCallsInterval = 2000;
let testName = '';
let testEnvironment = '';

export async function all(client: Client, request: Request) {
    const service = new GeneralService(client);

    testName = 'Tests_Manager';
    testEnvironment = client.BaseURL.includes('staging')
        ? 'Sandbox'
        : client.BaseURL.includes('papi-eu')
        ? 'Production-EU'
        : 'Production';
    const { describe, expect, it, run, setNewTestHeadline, addTestResultUnderHeadline, printTestResults } = tester(
        testName,
        testEnvironment,
    );

    const postTestsResponseArr = [] as any;

    for (const key in request.body) {
        //POST test job
        postTestsResponseArr.push(await service.papiClient.post(request.body[key]));
        setNewTestHeadline(key);
    }

    const testsPromiseArr = [] as any;

    postTestsResponseArr.forEach((test) => {
        testsPromiseArr.push(waitForSyncStatus(test.ExecutionUUID, 10 * 60000));
    });

    //Print Test Results
    const testResult = await Promise.all(testsPromiseArr)
        .then(() => {
            let index = 0;
            for (const key in request.body) {
                testsPromiseArr[index].then(function (val) {
                    addTestResultUnderHeadline(
                        key,
                        `${key} Test Results: `,
                        (JSON.parse(val.AuditInfo.ResultObject).stats.failures = 0),
                    );
                });
                index++;
            }
        })
        .then(() => {
            printTestResults(describe, expect, it, 'Tests Manager');
            return run();
        });

    return testResult;

    //#region wait for status
    async function waitForSyncStatus(uuid: string, maxTime: number) {
        const maxLoops = maxTime / (apiCallsInterval * 10);
        let counter = 0;
        let apiGetResponse;
        service.sleep(4000); //Allow the creation of audit log before starting to pull
        do {
            if (apiGetResponse != undefined) {
                service.sleep(apiCallsInterval * 10);
            }
            counter++;
            apiGetResponse = await service.papiClient.auditLogs.uuid(uuid).get();
        } while (
            (apiGetResponse.Status.Name == ('InProgress' as AuditStatus) ||
                apiGetResponse.Status.Name == ('InRetry' as AuditStatus)) &&
            Date.parse(apiGetResponse.ModificationDateTime) - Date.parse(apiGetResponse.CreationDateTime) < maxTime &&
            counter < maxLoops
        );
        return apiGetResponse;
    }
    //#endregion wait for status
}
