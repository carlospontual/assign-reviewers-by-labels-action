import {describe, it, expect, beforeAll, afterAll} from 'vitest'
import {http, HttpResponse} from 'msw'
import {setupServer} from 'msw/node'

import {getConfigFromUrlAsync} from '../getConfigFromUrlAsync'
import {Config} from '../../config'

const mockUrl = 'http://localhost:8080'

describe('getConfigFromUrlAsync', () => {
  const server = setupServer(
    http.get(`${mockUrl}/success`, req => {
      if (req.request.headers.get('test') !== 'header') {
        return new HttpResponse(null, {
          status: 403
        })
      }

      return HttpResponse.json({
        assign: {
          test: ['reviewer1', 'reviewer2']
        }
      })
    }),
    http.get(`${mockUrl}/500`, _ => {
      return new HttpResponse(null, {
        status: 500
      })
    }),
    http.get(`${mockUrl}/invalid-format`, req => {
      return new HttpResponse('text')
    })
  )

  beforeAll(() => {
    server.listen()
  })

  afterAll(() => {
    server.close()
  })

  it('should return the json response', async () => {
    const response = await getConfigFromUrlAsync<Config>(
      `${mockUrl}/success`,
      'test-ref',
      {
        test: 'header'
      }
    )

    expect(response).toEqual({
      assign: {
        test: ['reviewer1', 'reviewer2']
      }
    })
  })

  it('should throw an error if the response throws a 500', async () => {
    const mock500Url = `${mockUrl}/500`
    await expect(() => {
      return getConfigFromUrlAsync<Config>(mock500Url, 'test-ref', {
        test: 'header'
      })
    }).rejects.toThrowError(
      `Failed to load configuration for sha "test-ref" - Response status (500) from ${mock500Url}`
    )
  })

  it('should throw an error if the response is not json', async () => {
    const mock500Url = `${mockUrl}/invalid-format`
    await expect(() => {
      return getConfigFromUrlAsync<Config>(mock500Url, 'test-ref', {
        test: 'header'
      })
    }).rejects.toThrowError(
      `Failed to load configuration for sha "test-ref" - invalid json response body at ${mock500Url}`
    )
  })
})
