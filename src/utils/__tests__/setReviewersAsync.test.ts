import {describe, it, expect, vi, Mock} from 'vitest'
import type {Client} from '../../types'

import {setReviewersAsync} from '../setReviewersAsync'

function getMockClient(mockFn: Mock): Client {
  return {
    rest: {
      pulls: {
        requestReviewers: mockFn,
        removeRequestedReviewers: mockFn
      }
    }
  } as unknown as Client
}

describe('setReviewersAsync', () => {
  it('should set the reviewers to assign to the pull request', async () => {
    const mockRequestReviewers = vi
      .fn()
      .mockImplementation(() => ({url: 'test'}))
    const mockClient = getMockClient(mockRequestReviewers)

    const result = await setReviewersAsync({
      client: mockClient,
      contextPayload: {
        pull_request: {
          number: 1,
          user: {
            login: 'test-user'
          }
        },
        repository: {
          name: 'test-repo',
          owner: {
            login: 'test-owner'
          }
        }
      },
      reviewers: ['reviewer1', 'test-user'],
      action: 'assign'
    })

    expect(mockRequestReviewers).toHaveBeenCalledWith({
      owner: 'test-owner',
      pull_number: 1,
      repo: 'test-repo',
      reviewers: ['reviewer1']
    })
    expect(mockRequestReviewers).toHaveBeenCalledTimes(1)
    expect(result).toEqual({url: 'test'})
  })

  it('should filter out bot reviewers with [bot] suffix', async () => {
    const mockRequestReviewers = vi
      .fn()
      .mockImplementation(() => ({url: 'test'}))
    const mockClient = getMockClient(mockRequestReviewers)

    const result = await setReviewersAsync({
      client: mockClient,
      contextPayload: {
        pull_request: {
          number: 1,
          user: {
            login: 'test-user'
          }
        },
        repository: {
          name: 'test-repo',
          owner: {
            login: 'test-owner'
          }
        }
      },
      reviewers: ['reviewer1', 'copilot-pull-request-reviewer[bot]', 'reviewer2'],
      action: 'assign'
    })

    expect(mockRequestReviewers).toHaveBeenCalledWith({
      owner: 'test-owner',
      pull_number: 1,
      repo: 'test-repo',
      reviewers: ['reviewer1', 'reviewer2']
    })
    expect(result).toEqual({url: 'test'})
  })

  it('should return null if all reviewers are bots or the PR owner', async () => {
    const mockRequestReviewers = vi.fn()
    const mockClient = getMockClient(mockRequestReviewers)

    const result = await setReviewersAsync({
      client: mockClient,
      contextPayload: {
        pull_request: {
          number: 1,
          user: {
            login: 'test-user'
          }
        },
        repository: {
          name: 'test-repo',
          owner: {
            login: 'test-owner'
          }
        }
      },
      reviewers: ['test-user', 'copilot-pull-request-reviewer[bot]'],
      action: 'assign'
    })

    expect(mockRequestReviewers).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })
})
