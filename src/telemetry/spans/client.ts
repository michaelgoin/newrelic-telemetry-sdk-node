import { BaseClient, SendDataOptions, SendCallback, RequestData } from '../base-client'
import { SpanBatch } from './batch'
import { Logger} from '../../common'

const SPAN_HOST = 'trace-api.newrelic.com'
const SPAN_PORT = 443
const SPAN_PATH = '/trace/v1'
const SPAN_DATA_FORMAT = 'newrelic'
const SPAN_DATA_FORMAT_VERSION = 1
const INVALID_KEY_MESSAGE = 'A valid key must be provided for inserting spans.'

export interface SpanClientOptions {
  /**
   * API key with insert access used to authenticate the request.
   * For more information on creating keys, please see:
   * https://docs.newrelic.com/docs/insights/insights-data-sources/custom-data/introduction-event-api#register
   */
  apiKey: string
  /**
   * Optional host override for trace endpoint.
   */
  host?: string
  /**
   * Optional port override for trace endpoint.
   */
  port?: number
}

export class SpanClient extends BaseClient<SpanBatch> {
  private readonly _hasValidKey: boolean
  private readonly _sendDataOptions: SendDataOptions

  public constructor(options: SpanClientOptions, logger?: Logger) {
    super(logger)

    this._hasValidKey = this._isValidKey(options && options.apiKey)

    const headers = {
      'Api-Key': options && options.apiKey,
      'Data-Format': SPAN_DATA_FORMAT,
      'Data-Format-Version': SPAN_DATA_FORMAT_VERSION,
    }

    this._sendDataOptions = {
      headers: headers,
      host: (options && options.host) || SPAN_HOST,
      pathname: SPAN_PATH,
      port: (options && options.port) || SPAN_PORT
    }
  }

  private _isValidKey(insertKey: string): boolean {
    return !!insertKey
  }

  /**
   * Sends a SpanBatch to the New Relic Trace endpoint.
   * @param data
   * @param callback
   */
  public send(data: SpanBatch, callback: SendCallback<SpanBatch>): void {
    if (!this._hasValidKey) {
      const keyError = new Error(INVALID_KEY_MESSAGE)
      callback(keyError, null, null)
    }

    const retryData: RequestData<SpanBatch> = {
      client: this,
      originalData: data
    }

    const payload = `[${JSON.stringify(data)}]`

    this._sendData(this._sendDataOptions, payload, (err, res, body): void => {
      callback(err, res, body, retryData)
    })
  }
}
