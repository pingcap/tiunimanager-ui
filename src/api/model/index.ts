import {
  ClusterBackupClusterDataReq,
  ClusterCreateClusterReq,
  ClusterQueryClusterDetailResp,
  ClusterRestoreNewClusterReq,
  ClusterSaveBackupStrategyReq,
  ClusterUpdateClusterParametersReq,
  ControllerCommonResult,
  ControllerResultWithPage,
  MessageLoginReq,
  MessageLoginResp,
  KnowledgeClusterComponent,
  KnowledgeClusterComponentSpec,
  KnowledgeClusterVersionSpec,
  MessageQueryWorkFlowDetailResp,
  StructsWorkFlowInfo,
  StructsWorkFlowInfoStatusEnum,
  StructsWorkFlowNodeInfoStatusEnum,
  StructsWorkFlowNodeInfo,
  KnowledgeClusterType,
  KnowledgeClusterTypeSpec,
  KnowledgeClusterVersion,
  ClusterPreviewClusterResp,
  MessageDataExportReq,
  MessageDataImportReq,
  StructsBackupRecord,
  StructsClusterInfo,
  StructsClusterInstanceInfo,
  StructsClusterLogItem,
  StructsClusterParameterInfo,
  StructsDataImportExportRecordInfo,
  StructsHierarchyTreeNode,
  StructsHostInfo,
  ClusterScaleOutClusterReq,
  ClusterScaleInClusterReq,
  StructsClusterResourceParameterCompute,
  StructsClusterResourceParameterComputeResource,
  ClusterTakeoverClusterReq,
  ClusterTiDBDownstream,
  ClusterMysqlDownstream,
  ClusterKafkaDownstream,
  ClusterKafkaDownstreamProtocolEnum,
  ClusterDetailChangeFeedTaskResp,
  ClusterCreateChangeFeedTaskReq,
  ClusterUpdateChangeFeedTaskReq,
  ClusterQueryChangeFeedTaskResp,
  ClusterQueryChangeFeedTaskRespDownstreamTypeEnum,
  ClusterQueryChangeFeedTaskRespStatusEnum,
} from '#/api'
import { loadI18nWithNS } from '@i18n-macro'

export type PagedResult = ControllerResultWithPage
export type CommonResult = ControllerCommonResult

export type UserInfo = MessageLoginResp

export type ClusterDetails = ClusterQueryClusterDetailResp
export type ClusterInfo = StructsClusterInfo
export type ClusterRawTopologyItem = StructsClusterResourceParameterCompute
export type ClusterRawTopologyResourceItem =
  StructsClusterResourceParameterComputeResource
export type ClusterComponentNodeInfo = StructsClusterInstanceInfo
export type ClusterParamItem = StructsClusterParameterInfo
export type ClusterLogItem = StructsClusterLogItem
export type ClusterBackupItem = StructsBackupRecord

export type ClusterDataReplicationDetail = ClusterDetailChangeFeedTaskResp
export type ClusterDataReplicationItem = ClusterQueryChangeFeedTaskResp
export type ClusterDownstreamKafka = ClusterKafkaDownstream
export type ClusterDownstreamMySQL = ClusterMysqlDownstream
export type ClusterDownstreamTiDB = ClusterTiDBDownstream

export type ClusterType = KnowledgeClusterType
export type ClusterVersion = KnowledgeClusterVersion
export type ClusterComponent = KnowledgeClusterComponent

export type TransportRecord = StructsDataImportExportRecordInfo

export type HostInfo = StructsHostInfo

export type ResourceTreeNode = StructsHierarchyTreeNode

export type ClusterPreview = ClusterPreviewClusterResp

export type TaskWorkflowInfo = StructsWorkFlowInfo
export type TaskWorkflowDetailInfo = MessageQueryWorkFlowDetailResp
export type TaskWorkflowSubTaskInfo = StructsWorkFlowNodeInfo

export type KnowledgeOfClusterType = KnowledgeClusterTypeSpec
export type KnowledgeOfClusterVersion = KnowledgeClusterVersionSpec
export type KnowledgeOfClusterComponent = KnowledgeClusterComponentSpec

export type UserLoginRequest = MessageLoginReq

export type RequestBackupCreate = ClusterBackupClusterDataReq
export type RequestBackupStrategyUpdate = ClusterSaveBackupStrategyReq
export type RequestBackupRestore = ClusterRestoreNewClusterReq
export type RequestTransportExport = MessageDataExportReq
export type RequestTransportImport = MessageDataImportReq
export type RequestClusterCreate = ClusterCreateClusterReq
export type RequestClusterParamsUpdate = ClusterUpdateClusterParametersReq
export type RequestClusterScaleOut = ClusterScaleOutClusterReq
export type RequestClusterScaleIn = ClusterScaleInClusterReq
export type RequestClusterTakeover = ClusterTakeoverClusterReq

export type RequestClusterDataReplicationCreate = ClusterCreateChangeFeedTaskReq
export type RequestClusterDataReplicationUpdate = ClusterUpdateChangeFeedTaskReq

export { StructsWorkFlowInfoStatusEnum as TaskWorkflowStatus }
export { StructsWorkFlowNodeInfoStatusEnum as TaskWorkflowSubTaskStatus }

export enum ProductStatus {
  online = 'Online',
  offline = 'Offline',
}

export enum HardwareArch {
  x86 = 'X86',
  x86_64 = 'X86_64',
  arm = 'ARM',
  arm64 = 'ARM64',
}

export enum DiskType {
  nvme = 'NVMeSSD',
  ssd = 'SSD',
  sata = 'SATA',
}

export enum ClusterLogLevel {
  debug = 'DEBUG',
  info = 'INFO',
  warn = 'WARN',
  error = 'ERROR',
  fatal = 'FATAL',
}

export enum ResourceUnitType {
  region = 1,
  zone,
  rack,
  host,
}

export enum ClusterStatus {
  initializing = 'Initializing',
  stopped = 'Stopped',
  running = 'Running',
  recovering = 'Recovering',
  failure = 'Failure',
}

export enum ClusterNodeStatus {
  initializing = 'Initializing',
  stopped = 'Stopped',
  running = 'Running',
  recovering = 'Recovering',
  failure = 'Failure',
}

export enum BackupStatus {
  initializing = 'Initializing',
  processing = 'Processing',
  success = 'Finished',
  failed = 'Failed',
}

export enum TransportStatus {
  initializing = 'Initializing',
  processing = 'Processing',
  success = 'Finished',
  failed = 'Failed',
}

export enum ClusterOperationStatus {
  creating = 'Creating',
  cloning = 'Cloning',
  deleting = 'Deleting',
  stopping = 'Stopping',
  restarting = 'Restarting',
  backingUp = 'BackUp',
  restoring = 'Restore',
  scalingIn = 'ScaleIn',
  scalingOut = 'ScaleOut',
  upgrading = 'Upgrading',
  switching = 'Switching',
  applyingParams = 'ModifyParameterRestarting',
  takingOver = 'Takeover',
}

export enum ClusterBackupMethod {
  manual = 'manual',
}

export enum ClusterDataReplicationDownstreamDisplay {
  tidb = 'TiDB',
  mysql = 'MySQL',
  kafka = 'Kafka',
}

export { ClusterQueryChangeFeedTaskRespDownstreamTypeEnum as ClusterDataReplicationDownstreamType }

export { ClusterQueryChangeFeedTaskRespStatusEnum as ClusterDataReplicationStatus }

export { ClusterKafkaDownstreamProtocolEnum as ClusterDataReplicationKafkaProtocol }

export function initModelTranslations() {
  // load translations
  loadI18nWithNS('model')
}
