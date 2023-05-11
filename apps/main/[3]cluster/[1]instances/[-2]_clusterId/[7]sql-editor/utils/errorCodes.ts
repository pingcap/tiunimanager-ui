import axios from 'axios'

// import { log } from 'common/log'

export enum ErrorMessage {
  PENDING_USER = 'pending user',
  PENDING_SIGNUP_USER = 'pending signup user',
  PENDING_SIGNUP_SSO_USER = 'pending signup sso user',
  UNREGISTERED_USER = 'unregistered user',
  INACTIVE_USER = 'inactive user',
  UNREGISTERED_SSO_USER = 'unregistered sso user',
}

export enum ErrorCode {
  DUPLICATE_CLUSTER_NAME = 60100001,
  CREATE_CLUSTER_NO_CIDR = 60100002,
  CREATE_CLUSTER_NO_POC_POINTS = 60100003,
  CREATE_CLUSTER_SECONDARY_CLUSTER_LIMIT = 60100005,
  CREATE_CLUSTER_QUOTA_LIMIT = 60100006,
  CREATE_CLUSTER_DEV_TIER_TRIAL_EXPIRED = 60100007,
  CREATE_CLUSTER_DEV_TIER_LIMIT = 60100008,
  CREATE_CLUSTER_DEV_DISABLED = 60100009,
  SCALE_CLUSTER_TIKV_STORAGE_RATE_LIMITED = 60100018,
  SCALE_CLUSTER_TIFLASH_STORAGE_RATE_LIMITED = 60100019,
  SCALE_CLUSTER_DISABLE_LOCAL_DISK = 60100020,
  SCALE_CLUSTER_NON_EKS = 60100030,

  DUPLICATED_CIDR = 60100017,

  PAUSE_CLUSTER_ONLY_WHEN_AVAILABLE = 60100026,
  PAUSE_CLUSTER_WHEN_BACKING = 60100027,
  PAUSE_CLUSTER_WHEN_IMPORTING = 60100028,
  PAUSE_CLUSTER_HAS_CHANGEFEEDS = 60100029,

  TENANT_ACCOUNT_EXISTS = 60200001,
  TENANT_PASSWORD_INVALID = 60200002,
  TENANT_MARKETPLACE_ACCOUNT_EXISTS = 60200003,

  XACCOUNT_REGION_USED = 60100011,
  XACCOUNT_PROJECT_USED = 60100012,
  XACCOUNT_DELETE_CLUSTER_FAILED = 60100013,
  XACCOUNT_DELETE_ROLE_FAILED = 60100014,
  XACCOUNT_ROLE_EXISTS = 60100015,

  COMMON_PARAMETERS_ERROR = 49900001,
  COMMON_DATA_CONFLICTS = 69900002,

  CLUSTER_NOT_FOUND = 49900004,

  CREATE_PRIVATE_ENDPOINT_SERVICE_ERROR = 60100031,

  // for VPC Peering
  FREE_TRIAL_VPC_PEERING_ERROR = 60100033,
  DEV_TIER_VPC_PEERING_ERROR = 60100034,
  PROJECT_CIDR_CONFLICTS_ERROR = 60100035,
  PEERING_VPC_CIDR_CONFLICTS_ERROR = 60100036,
  REGION_CIDR_CONFLICTS_ERROR = 60100037,

  TRAFFIC_FILTER_LIMIT_ERROR = 60100042,

  // for billing
  // why character string ? Waiting for TiError ready
  SYSTEM_INTERNAL_ERROR = 'SystemInternalError',
  PAYMENT_INTENTCONFIRM_ERROR = 'PaymentIntentConfirmError',
  PAYMENT_INTENTCONFIRM_FAIL = 'PaymentIntentConfirmFail',
}

export const ErrorMessageDict = {
  [ErrorCode.DUPLICATE_CLUSTER_NAME]:
    'The cluster name must be unique in a project.',
  [ErrorCode.CLUSTER_NOT_FOUND]: 'The cluster could not be found.',
  [ErrorCode.CREATE_CLUSTER_NO_CIDR]:
    'The CIDR is not set for the project and the cluster cannot be created.',
  [ErrorCode.CREATE_CLUSTER_NO_POC_POINTS]: 'You have used up your credits.',
  [ErrorCode.CREATE_CLUSTER_SECONDARY_CLUSTER_LIMIT]:
    'Cannot create more than one Secondary Cluster to a Primary Cluster.',
  [ErrorCode.CREATE_CLUSTER_QUOTA_LIMIT]:
    'The total number of your nodes has exceeded the maximum allowed limit for your organization, please <a href="https://support.pingcap.com/hc/en-us/" target="_blank">contact us</a> to request to increase the quota, or see the <a href="https://docs.pingcap.com/tidbcloud/limitations-and-quotas" target="_blank">details</a> for the limitations.',
  [ErrorCode.CREATE_CLUSTER_DEV_TIER_TRIAL_EXPIRED]:
    'Your one year free Serverless Tier has expired. You are no longer able to create new free trial clusters.',
  [ErrorCode.CREATE_CLUSTER_DEV_TIER_LIMIT]:
    'You have reached the maximum number of Serverless Tier clusters.',
  [ErrorCode.CREATE_CLUSTER_DEV_DISABLED]:
    'Serverless Tier clusters are currently disabled. Please check back at a later time.',
  [ErrorCode.PAUSE_CLUSTER_ONLY_WHEN_AVAILABLE]:
    'The cluster can be paused only when it is AVAILABLE.',
  [ErrorCode.PAUSE_CLUSTER_WHEN_BACKING]:
    'You cannot pause your cluster if the cluster is backing up. You can either wait for the current backup jobs finished or <a href="https://docs.pingcap.com/tidbcloud/backup-and-restore#delete-a-running-backup-job" target="_blank">delete the running backup job</a>.',
  [ErrorCode.PAUSE_CLUSTER_WHEN_IMPORTING]:
    'You cannot pause your cluster if the cluster is being imported. You can either wait for the import task finished or cancel the import task on TiDB Cloud UI.',
  [ErrorCode.PAUSE_CLUSTER_HAS_CHANGEFEEDS]:
    'You cannot pause your cluster if the cluster has any <a href="https://docs.pingcap.com/tidbcloud/changefeed-overview" target="_blank">Changefeeds</a>. You need to delete any existing Changefeeds (<a href="https://docs.pingcap.com/tidbcloud/changefeed-sink-to-apache-kafka#delete-a-sink" target="_blank">Delete Sink to Apache Kafka</a> or <a href="https://docs.pingcap.com/tidbcloud/changefeed-sink-to-mysql#delete-a-sink" target="_blank">Delete Sink to MySQL</a>) before pausing the cluster.',
  [ErrorCode.TENANT_ACCOUNT_EXISTS]: `Email address is already in use, please <a href="${window.location.origin}" target="_blank">sign in</a>.`,
  [ErrorCode.TENANT_PASSWORD_INVALID]:
    'The password should contain the following types of characters: upper case letters (A-Z), lower case letters (a-z), numbers (such as 0-9).',
  [ErrorCode.TENANT_MARKETPLACE_ACCOUNT_EXISTS]:
    'This marketplace account has already been registered, please contact your admin.',
  [ErrorCode.XACCOUNT_REGION_USED]:
    'Region already has a cross-account configuration. You can only create one cross-account configuration in each region.',
  [ErrorCode.XACCOUNT_PROJECT_USED]:
    'Cannot configure cross-account configuration for this project. Please use a new project.',
  [ErrorCode.XACCOUNT_DELETE_CLUSTER_FAILED]: `
    <div>
      <p>Cannot delete this cross-account configuration because there still have clusters and backups which are associated with this configuration.</p>
      <ul>
        <li>
          <a href="/console/clusters" target="_blank">Clusters</a>
        </li>
        <li>
          <a href="/console/recycle-bin" target="_blank">Recycle Bin</a>
        </li>
      </ul>
    </div
  `,
  [ErrorCode.XACCOUNT_DELETE_ROLE_FAILED]: 'Role is used, can not be deleted.',
  [ErrorCode.XACCOUNT_ROLE_EXISTS]: 'The Role ARN already exists.',
  [ErrorCode.COMMON_PARAMETERS_ERROR]: 'Please refresh the page and try again.',
  [ErrorCode.COMMON_DATA_CONFLICTS]: 'Please refresh the page and try again.',
  [ErrorCode.DUPLICATED_CIDR]: 'Duplicated CIDR / IP address.',
  [ErrorCode.SCALE_CLUSTER_TIKV_STORAGE_RATE_LIMITED]: `You've reached the maximum modification rate per storage of TiKV. Wait at least 6 hours between modifications per storage of TiKV.`,
  [ErrorCode.SCALE_CLUSTER_TIFLASH_STORAGE_RATE_LIMITED]: `You've reached the maximum modification rate per storage of TiFlash. Wait at least 6 hours between modifications per storage of TiFlash.`,
  [ErrorCode.CREATE_PRIVATE_ENDPOINT_SERVICE_ERROR]: `The current status of the cluster is not allowed to create a private endpoint.`,
  [ErrorCode.SCALE_CLUSTER_DISABLE_LOCAL_DISK]:
    "Can't modify, the disks are local storage.",
  // TODO: update error message after New Arch publish
  [ErrorCode.SCALE_CLUSTER_NON_EKS]:
    'You can only increase the node size for AWS clusters created after 2022/12/31.',
  [ErrorCode.SYSTEM_INTERNAL_ERROR]: 'Internal error.',
  [ErrorCode.PAYMENT_INTENTCONFIRM_ERROR]: 'Error at confirm the card.',
  [ErrorCode.PAYMENT_INTENTCONFIRM_FAIL]: 'Failed to confirm the card.',
  [ErrorCode.FREE_TRIAL_VPC_PEERING_ERROR]:
    'Free trial users are not allowed to create VPC Peering.',
  [ErrorCode.DEV_TIER_VPC_PEERING_ERROR]:
    'You should create at least one non-free tier cluster in that region before creating a VPC Peering.',
  [ErrorCode.PROJECT_CIDR_CONFLICTS_ERROR]:
    'The CIDR you filled in conflicts with Project CIDR, and you cannot create a VPC Peering.',
  [ErrorCode.PEERING_VPC_CIDR_CONFLICTS_ERROR]:
    'The CIDR you filled in conflicts with the current Peering VPC CIDR, and you cannot create a VPC Peering.',
  [ErrorCode.REGION_CIDR_CONFLICTS_ERROR]:
    'The  CIDR you filled in conflicts with Region CIDR, and you cannot create a VPC Peering.',
  [ErrorCode.TRAFFIC_FILTER_LIMIT_ERROR]: `The traffic filtering rules of your Dedicated cluster have reached the upper limit. If you need to apply for quota, please contact <a href="https://docs.pingcap.com/tidbcloud/tidb-cloud-support" target="_blank" rel="noopener noreferrer">TiDB Cloud Support</a>.`,
}

export class TimeoutError extends Error {
  name = 'TimeoutError'
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, TimeoutError.prototype)
  }
}

export class ResponseError extends Error {
  name = 'ResponseError'
  errorCode: number
  originalMessage = ''
  constructor(message: string, errorCode: number, originalMessage?: string) {
    super(message)
    Object.setPrototypeOf(this, ResponseError.prototype)
    this.errorCode = errorCode
    if (originalMessage) {
      this.originalMessage = originalMessage
    }
  }
}

/**
 * Pick response status and data message from error response
 * @param e error instance
 */
export function pickErrorResponse(e: any) {
  if (!axios.isAxiosError(e)) {
    return {
      status: void 0,
      message: void 0,
    }
  }

  const { status, data } = e.response || {}
  const message = data?.base_resp?.err_msg || data?.message || ''

  return {
    status,
    message,
  }
}

export const RetryMsg = `Please retry in a short while or contact <a href="https://docs.pingcap.com/tidbcloud/tidb-cloud-support" target="_blank" rel="noopener noreferrer">technical support</a>.`

export const defaultErrorMsg = `Unexpected error. ${RetryMsg}`
export const NetworkErrorMsg = `Network error. ${RetryMsg}`
export const UnexpectedError =
  'Unexpected error. Please retry in a short while.'

export function getErrorMessage(e: any, useOriginal?: boolean) {
  if (!e) return ''

  if (axios.isAxiosError(e)) {
    // axios HTTP response error
    return e?.response?.data?.message || e?.message || defaultErrorMsg
  } else if (axios.isCancel(e)) {
    return e?.message || 'Request cancelled'
  } else if (e instanceof ResponseError || e instanceof Error) {
    // API response business error
    if (useOriginal && e instanceof ResponseError) {
      return e.originalMessage || defaultErrorMsg
    }
    return e?.message || defaultErrorMsg
  } else {
    // other unknown error
    // log.exception(e)
    return defaultErrorMsg
  }
}
