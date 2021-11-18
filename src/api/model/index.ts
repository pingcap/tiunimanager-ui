import {
  BackuprestoreBackupReq,
  BackuprestoreBackupStrategyUpdateReq,
  BackuprestoreRestoreReq,
  ImportexportDataExportReq,
  ImportexportDataImportReq,
  ManagementCreateReq,
  ParameterParamUpdateReq,
  IdentificationLoginInfo,
  ParameterParamItem,
  ManagementClusterDisplayInfo,
  LogSearchTiDBLogDetail,
  ControllerResultWithPage,
  ControllerCommonResult,
  IdentificationUserIdentity,
  HostresourceHostInfo,
  BackuprestoreBackupRecord,
  ManagementComponentNodeDisplayInfo,
  ManagementDetailClusterRsp,
  WarehouseDomainResource,
  KnowledgeClusterTypeSpec,
  KnowledgeClusterComponentSpec,
  KnowledgeClusterVersionSpec,
  FlowtaskFlowWorkDetailInfo,
  FlowtaskFlowWorkDisplayInfo,
  FlowtaskFlowWorkTaskInfo,
  KnowledgeClusterType,
  KnowledgeClusterVersion,
  KnowledgeClusterComponent,
  ImportexportDataTransportInfo,
} from '#/api'

export type PagedResult = ControllerResultWithPage
export type CommonResult = ControllerCommonResult

export type UserInfo = IdentificationUserIdentity

export type ClusterInfo = ManagementClusterDisplayInfo
export type ClusterComponentNodeInfo = ManagementComponentNodeDisplayInfo
export type ClusterParamItem = ParameterParamItem
export type ClusterLogItem = LogSearchTiDBLogDetail
export type ClusterBackupItem = BackuprestoreBackupRecord

export type ClusterType = KnowledgeClusterType
export type ClusterVersion = KnowledgeClusterVersion
export type ClusterComponent = KnowledgeClusterComponent

export type TransportRecord = ImportexportDataTransportInfo

export type ClusterLogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

export type HostInfo = HostresourceHostInfo
export type DomainResourceInfo = WarehouseDomainResource

export type TaskWorkflowInfo = FlowtaskFlowWorkDisplayInfo
export type TaskWorkflowDetailInfo = FlowtaskFlowWorkDetailInfo
export type TaskWorkflowSubTaskInfo = FlowtaskFlowWorkTaskInfo

export type KnowledgeOfClusterType = KnowledgeClusterTypeSpec
export type KnowledgeOfClusterVersion = KnowledgeClusterVersionSpec
export type KnowledgeOfClusterComponent = KnowledgeClusterComponentSpec

export type UserLoginRequest = IdentificationLoginInfo

export type RequestBackupCreate = BackuprestoreBackupReq
export type RequestBackupStrategyUpdate = BackuprestoreBackupStrategyUpdateReq
export type RequestBackupRestore = BackuprestoreRestoreReq
export type RequestTransportExport = ImportexportDataExportReq
export type RequestTransportImport = ImportexportDataImportReq
export type RequestClusterCreate = ManagementCreateReq
export type RequestClusterParamsUpdate = ParameterParamUpdateReq

export type ResponseClusterDetail = ManagementDetailClusterRsp

import { loadI18nWithNS } from '@i18n-macro'

export function initModelTranslations() {
  // load translations
  loadI18nWithNS('model')
}
