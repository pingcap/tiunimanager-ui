/*
 * Copyright 2022 PingCAP
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  StructsVendorConfigInfo,
  StructsRegionConfigInfo,
  StructsZoneInfo,
  StructsSpecInfo,
  StructsProductConfigInfo,
  ClusterBackupClusterDataReq,
  ClusterCreateClusterReq,
  ClusterQueryClusterDetailResp,
  ClusterRestoreNewClusterReq,
  ClusterSaveBackupStrategyReq,
  ClusterCancelBackupReq,
  ClusterUpdateClusterParametersReq,
  ControllerCommonResult,
  ControllerResultWithPage,
  MessageLoginReq,
  MessageLoginResp,
  MessageQueryWorkFlowDetailResp,
  StructsWorkFlowInfo,
  StructsWorkFlowInfoStatusEnum,
  StructsWorkFlowNodeInfoStatusEnum,
  StructsWorkFlowNodeInfo,
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
  ClusterCloneClusterReq,
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
  ClusterUpgradeClusterReq,
  ClusterUpgradeClusterReqUpgradeWayEnum,
  StructsProductUpgradeVersionConfigDiffItem,
  StructsClusterRelations,
  MessageQueryParameterGroupResp,
  MessageUpdateParameterGroupReq,
  MessageCreateParameterGroupReq,
  MessageCopyParameterGroupReq,
  MessageApplyParameterGroupReq,
  StructsParameterGroupParameterInfo,
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

export type ClusterUpgradeParamDiffItem =
  StructsProductUpgradeVersionConfigDiffItem

export type ClusterRelations = StructsClusterRelations

export type TransportRecord = StructsDataImportExportRecordInfo

export type HostInfo = StructsHostInfo

export type ResourceTreeNode = StructsHierarchyTreeNode

export type ClusterPreview = ClusterPreviewClusterResp

export type TaskWorkflowInfo = StructsWorkFlowInfo
export type TaskWorkflowDetailInfo = MessageQueryWorkFlowDetailResp
export type TaskWorkflowSubTaskInfo = StructsWorkFlowNodeInfo

export type UserLoginRequest = MessageLoginReq

export type RequestBackupCreate = ClusterBackupClusterDataReq
export type RequestBackupStrategyUpdate = ClusterSaveBackupStrategyReq
export type RequestBackupRestore = ClusterRestoreNewClusterReq
export type RequestBackupCancel = ClusterCancelBackupReq
export type RequestTransportExport = MessageDataExportReq
export type RequestTransportImport = MessageDataImportReq
export type RequestClusterCreate = ClusterCreateClusterReq
export type RequestClusterParamsUpdate = ClusterUpdateClusterParametersReq
export type RequestClusterScaleOut = ClusterScaleOutClusterReq
export type RequestClusterScaleIn = ClusterScaleInClusterReq
export type RequestClusterTakeover = ClusterTakeoverClusterReq
export type RequestClusterClone = ClusterCloneClusterReq

export type RequestClusterDataReplicationCreate = ClusterCreateChangeFeedTaskReq
export type RequestClusterDataReplicationUpdate = ClusterUpdateChangeFeedTaskReq

export type RequestClusterUpgrade = ClusterUpgradeClusterReq

/**
 * Platform - Data Center
 */

export type DataCenterItemInfo = StructsVendorConfigInfo
export type DCRegionItemInfo = StructsRegionConfigInfo
export type DCZoneItemInfo = StructsZoneInfo
export type DCSpecItemInfo = StructsSpecInfo

/**
 * Platform - Products
 */

export type ProductItemInfo = StructsProductConfigInfo

/**
 * Parameter Group type
 */
export type ParamGroupItem = MessageQueryParameterGroupResp

export type ParamItemDetail = StructsParameterGroupParameterInfo

export type RequestParamGroupCreate = MessageCreateParameterGroupReq
export type RequestParamGroupUpdate = MessageUpdateParameterGroupReq
export type RequestParamGroupCopy = MessageCopyParameterGroupReq
export type RequestParamGroupApply = MessageApplyParameterGroupReq

/**
 * Workflow Enum
 */
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
  beingCloned = 'BeingCloned',
}

export enum ClusterBackupMethod {
  manual = 'manual',
}

/**
 * Cluster clone Enums
 */

export enum ClusterCloneStrategy {
  sync = 'CDCSync',
  snapshot = 'Snapshot',
}

/**
 * Cluster Data Replication Enums
 */

export enum ClusterDataReplicationDownstreamDisplay {
  tidb = 'TiDB',
  mysql = 'MySQL',
  kafka = 'Kafka',
}

export { ClusterQueryChangeFeedTaskRespDownstreamTypeEnum as ClusterDataReplicationDownstreamType }

export { ClusterQueryChangeFeedTaskRespStatusEnum as ClusterDataReplicationStatus }

export { ClusterKafkaDownstreamProtocolEnum as ClusterDataReplicationKafkaProtocol }

/**
 * Cluster Upgrade Enums
 */

export enum ClusterUpgradeType {
  inPlace = 'in-place',
  migration = 'migration',
}

export { ClusterUpgradeClusterReqUpgradeWayEnum as ClusterUpgradeMethod }

/**
 * Parameter Group Enum
 */
export enum ParamGroupDBType {
  tidb = 1,
  dm = 2,
}

export enum ParamGroupCreationType {
  system = 1,
  custom = 2,
}

export enum ParamGroupScope {
  cluster = 1,
  instance = 2,
}

export enum ParamValueDataType {
  int = 0,
  string = 1,
  boolean = 2,
  float = 3,
  array = 4,
}

export enum ParamRangeType {
  none = 0,
  continuous = 1,
  discrete = 2,
}

export function initModelTranslations() {
  // load translations
  loadI18nWithNS('model')
}
