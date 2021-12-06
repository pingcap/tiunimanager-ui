import {
  BackuprestoreBackupReq,
  BackuprestoreBackupStrategyUpdateReq,
  BackuprestoreRestoreReq,
  ImportexportDataExportReq,
  ImportexportDataImportReq,
  ManagementCreateReq,
  ParameterUpdateParamsReq,
  IdentificationLoginInfo,
  ParameterListParamsResp,
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
  KnowledgeClusterType,
  KnowledgeClusterVersion,
  KnowledgeClusterComponent,
  WarehouseNode,
  ManagementPreviewClusterRsp,
  ImportexportDataTransportInfo,
} from '#/api'

export type PagedResult = ControllerResultWithPage
export type CommonResult = ControllerCommonResult

export type UserInfo = IdentificationUserIdentity

export type ClusterInfo = ManagementClusterDisplayInfo
export type ClusterComponentNodeInfo = ManagementComponentNodeDisplayInfo
export type ClusterParamItem = ParameterListParamsResp
export type ClusterLogItem = LogSearchTiDBLogDetail
export type ClusterBackupItem = BackuprestoreBackupRecord

export type HardwareArch = 'X86_64' | 'AMD64'

export type ClusterType = KnowledgeClusterType
export type ClusterVersion = KnowledgeClusterVersion
export type ClusterComponent = KnowledgeClusterComponent

export type TransportRecord = ImportexportDataTransportInfo

export type ClusterLogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

export type HostInfo = HostresourceHostInfo
export type DomainResourceInfo = WarehouseDomainResource

export enum ResourceUnitType {
  region = 1,
  zone,
  rack,
  host,
}

export type ResourceTreeNode = WarehouseNode

export type ClusterPreview = ManagementPreviewClusterRsp

export type TaskWorkflowInfo = FlowtaskFlowWorkDisplayInfo
export type TaskWorkflowDetailInfo = FlowtaskFlowWorkDetailInfo

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
export type RequestClusterParamsUpdate = ParameterUpdateParamsReq

export type ResponseClusterDetail = ManagementDetailClusterRsp

import { loadI18nWithNS } from '@i18n-macro'

export function initModelTranslations() {
  // load translations
  loadI18nWithNS('model')
}
