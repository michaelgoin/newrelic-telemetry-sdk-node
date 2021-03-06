import { AttributeMap } from '../attributeMap'

export interface SpanData {
  id: string
  'trace.id': string
  timestamp: number
  attributes?: AttributeMap
}

export class Span implements SpanData {
  public id: string
  public 'trace.id': string
  public timestamp: number
  public attributes?: AttributeMap

  // eslint-disable-next-line max-params
  public constructor(
    id: string,
    traceId: string,
    timestamp: number,
    name?: string,
    parentId?: string,
    serviceName?: string,
    durationMs?: number,
    attributes?: AttributeMap
  ) {
    this.id = id
    this['trace.id'] = traceId
    this.timestamp = timestamp

    if (name || parentId || serviceName || durationMs != null || attributes) {
      this.attributes = attributes || {}
      
      if (name) {
        this.attributes.name = name
      }

      if (parentId) {
        this.attributes['parent.id'] = parentId
      }

      if (serviceName) {
        this.attributes['service.name'] = serviceName
      }

      if (durationMs != null) {
        this.attributes['duration.ms'] = durationMs
      }
    }
  }
}
