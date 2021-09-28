import { rest } from 'msw'
import { basePath } from '@/api/client'

const fakeTidbLog = {
  code: 0,
  message: 'OK',
  data: {
    took: 4,
    results: [
      {
        index: 'tiem-tidb-cluster-2021.09.28',
        id: 'rFlOK3wBsOK-Nl8kxL_Z',
        level: 'ERROR',
        sourceLine: 'some:1',
        message:
          'New connected subchannel at 0x7ffa3b097a50 for subchannel 0x7ffa3b1106c0; New connected subchannel at 0x7ffa3b097a50 for subchannel 0x7ffa3b1106c0; New connected subchannel at 0x7ffa3b097a50 for subchannel 0x7ffa3b1106c0',
        ip: '172.16.6.176',
        clusterId: 'f7013vniS6mM4eVCdKM64g',
        module: 'tikv',
        ext: null,
        timestamp: '2021-09-28 15:29:13',
      },
      {
        index: 'tiem-tidb-cluster-2021.09.28',
        id: 'r1lOK3wBsOK-Nl8kxL_Z',
        level: 'INFO',
        sourceLine: 'util.rs:528',
        message: 'connected to PD leader',
        ip: '172.16.6.176',
        clusterId: 'f7013vniS6mM4eVCdKM64g',
        module: 'tikv',
        ext: {
          tikv: {
            endpoints: 'http://172.16.5.148:2379',
          },
        },
        timestamp: '2021-09-28 15:29:09',
      },
      {
        index: 'tiem-tidb-cluster-2021.09.28',
        id: 'sllOK3wBsOK-Nl8kxL_Z',
        level: 'INFO',
        sourceLine: 'util.rs:226',
        message: 'heartbeat sender and receiver are stale, refreshing ...',
        ip: '172.16.6.176',
        clusterId: 'f7013vniS6mM4eVCdKM64g',
        module: 'tikv',
        ext: {},
        timestamp: '2021-09-28 15:29:09',
      },
      {
        index: 'tiem-tidb-cluster-2021.09.28',
        id: 's1lOK3wBsOK-Nl8kxL_Z',
        level: 'WARN',
        sourceLine: 'util.rs:244',
        message: 'updating PD client done',
        ip: '172.16.6.176',
        clusterId: 'f7013vniS6mM4eVCdKM64g',
        module: 'tikv',
        ext: {
          tikv: {
            spend: '3.387714ms',
          },
        },
        timestamp: '2021-09-28 15:29:09',
      },
      {
        index: 'tiem-tidb-cluster-2021.09.28',
        id: 'tFlOK3wBsOK-Nl8k2L9f',
        level: 'INFO',
        sourceLine: 'client.rs:433',
        message: 'cancel region heartbeat sender',
        ip: '172.16.6.176',
        clusterId: 'f7013vniS6mM4eVCdKM64g',
        module: 'tikv',
        ext: {},
        timestamp: '2021-09-28 15:29:09',
      },
      {
        index: 'tiem-tidb-cluster-2021.09.28',
        id: 'rVlOK3wBsOK-Nl8kxL_Z',
        level: 'INFO',
        sourceLine: 'util.rs:463',
        message: 'connecting to PD endpoint',
        ip: '172.16.6.176',
        clusterId: 'f7013vniS6mM4eVCdKM64g',
        module: 'tikv',
        ext: {
          tikv: {
            endpoints: 'http://172.16.5.148:2379',
          },
        },
        timestamp: '2021-09-28 15:29:09',
      },
      {
        index: 'tiem-tidb-cluster-2021.09.28',
        id: 'qllOK3wBsOK-Nl8kxL_Z',
        level: 'INFO',
        sourceLine: 'util.rs:463',
        message: 'connecting to PD endpoint',
        ip: '172.16.6.176',
        clusterId: 'f7013vniS6mM4eVCdKM64g',
        module: 'tikv',
        ext: {
          tikv: {
            endpoints: 'http://172.16.4.187:2379',
          },
        },
        timestamp: '2021-09-28 15:29:09',
      },
      {
        index: 'tiem-tidb-cluster-2021.09.28',
        id: 'sVlOK3wBsOK-Nl8kxL_Z',
        level: 'INFO',
        sourceLine: 'range_task.go:219',
        message: 'range task finished',
        ip: '172.16.6.176',
        clusterId: 'f7013vniS6mM4eVCdKM64g',
        module: 'tidb',
        ext: {
          body: '["range task finished"] [name=resolve-locks-runner] [startKey=] [endKey=] ["cost time"=58.33431ms] ["completed regions"=23]',
          tidb: {
            name: 'resolve-locks-runner',
          },
        },
        timestamp: '2021-09-28 15:29:09',
      },
      {
        index: 'tiem-tidb-cluster-2021.09.28',
        id: 'tVlOK3wBsOK-Nl8k2L9f',
        level: 'INFO',
        sourceLine: 'gc_worker.go:977',
        message: '[gc worker] finish resolve locks',
        ip: '172.16.6.176',
        clusterId: 'f7013vniS6mM4eVCdKM64g',
        module: 'tidb',
        ext: {
          tidb: {
            regions: '23',
            safePoint: '428032275166003200',
            uuid: '5f0320ffc1c000e',
          },
        },
        timestamp: '2021-09-28 15:29:09',
      },
      {
        index: 'tiem-tidb-cluster-2021.09.28',
        id: 'rllOK3wBsOK-Nl8kxL_Z',
        level: 'INFO',
        sourceLine: 'gc_worker.go:956',
        message: '[gc worker] start resolve locks',
        ip: '172.16.6.176',
        clusterId: 'f7013vniS6mM4eVCdKM64g',
        module: 'tidb',
        ext: {
          tidb: {
            concurrency: '3',
            safePoint: '428032275166003200',
            uuid: '5f0320ffc1c000e',
          },
        },
        timestamp: '2021-09-28 15:29:09',
      },
    ],
  },
  page: {
    page: 1,
    pageSize: 10,
    total: 23407,
  },
}

export default [
  rest.get(basePath + '/logs/tidb/:clusterId/', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(fakeTidbLog))
  }),
]
