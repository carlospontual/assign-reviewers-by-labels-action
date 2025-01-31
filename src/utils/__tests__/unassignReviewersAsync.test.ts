import {describe, it, expect, afterEach, vi} from 'vitest'

import {unassignReviewersAsync} from '../unassignReviewersAsync'
import * as setReviewersAsyncFn from '../setReviewersAsync'
import {Client} from '../../types'

const mockClient = {} as unknown as Client

describe('unassignReviewersAsync', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should unassign reviewers when there are no labels', async () => {
    const spy = vi
      .spyOn(setReviewersAsyncFn, 'setReviewersAsync')
      .mockImplementationOnce(() =>
        Promise.resolve({
          url: 'mock-url'
        })
      )

    const result = await unassignReviewersAsync({
      client: mockClient,
      contextDetails: {
        labels: [],
        reviewers: ['reviewer1', 'reviewer3'],
        baseSha: 'test'
      },
      labelReviewers: {
        test: ['reviewer1'],
        test1: ['reviewer1', 'reviewer2']
      },
      contextPayload: {},
      inputLabels: []
    })

    expect(result).toEqual({
      status: 'success',
      message: 'Reviewers have been unassigned',
      data: {
        url: 'mock-url',
        reviewers: ['reviewer1', 'reviewer2']
      }
    })

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should only unassign reviewers from labels that have been removed', async () => {
    const spy = vi
      .spyOn(setReviewersAsyncFn, 'setReviewersAsync')
      .mockImplementationOnce(() =>
        Promise.resolve({
          url: 'mock-url'
        })
      )

    const result = await unassignReviewersAsync({
      client: mockClient,
      contextDetails: {
        labels: ['test'],
        reviewers: ['reviewer1', 'reviewer2', 'reviewer3'],
        baseSha: 'test'
      },
      labelReviewers: {
        test: ['reviewer1'],
        test1: ['reviewer1', 'reviewer2', 'reviewer3']
      },
      contextPayload: {},
      inputLabels: ['test']
    })

    expect(result).toEqual({
      status: 'success',
      message: 'Reviewers have been unassigned',
      data: {
        url: 'mock-url',
        reviewers: ['reviewer2', 'reviewer3']
      }
    })

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should do my thing', async () => {
    const spy = vi
      .spyOn(setReviewersAsyncFn, 'setReviewersAsync')
      .mockImplementationOnce(() =>
        Promise.resolve({
          url: 'mock-url'
        })
      )

    const result = await unassignReviewersAsync({
      client: mockClient,
      contextDetails: {
        labels: ['testlabel'],
        reviewers: ['reviewer1', 'reviewer3', 'reviewer4'],
        baseSha: 'test'
      },
      labelReviewers: {
        testlabel: ['reviewer1', 'reviewer2'],
        testlabel2: ['reviewer3', 'reviewer4'],
        testlabel3: ['reviewer5', 'reviewer6']
      },
      contextPayload: {},
      inputLabels: ['testlabel']
    })

    expect(result).toEqual({
      status: 'success',
      message: 'Reviewers have been unassigned',
      data: {
        url: 'mock-url',
        reviewers: ['reviewer3', 'reviewer4', 'reviewer5', 'reviewer6']
      }
    })

    expect(spy).toHaveBeenCalledTimes(1)
  })
})
