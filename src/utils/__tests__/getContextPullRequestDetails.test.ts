import {describe, it, expect, vi} from 'vitest'
import * as github from '@actions/github'

import {getContextPullRequestDetails} from '../getContextPullRequestDetails'

vi.mock('@actions/github', () => ({
  context: {
    payload: {}
  }
}))

describe('getContextPullRequestDetails', () => {
  it('should return null if there is no pull request', () => {
    github.context.payload = {}
    const result = getContextPullRequestDetails()
    expect(result).toBeNull()
  })

  it('should filter out Bot reviewers from the PR context', () => {
    github.context.payload = {
      pull_request: {
        labels: [{name: 'login'}],
        requested_reviewers: [
          {login: 'reviewer1', type: 'User'},
          {login: 'BOT_kgDOCnlnWA', type: 'Bot'},
          {login: 'reviewer2', type: 'User'}
        ],
        base: {sha: 'abc123'}
      }
    }

    const result = getContextPullRequestDetails()

    expect(result).toEqual({
      labels: ['login'],
      reviewers: ['reviewer1', 'reviewer2'],
      baseSha: 'abc123'
    })
  })

  it('should return an empty reviewers list if all reviewers are bots', () => {
    github.context.payload = {
      pull_request: {
        labels: [{name: 'login'}],
        requested_reviewers: [{login: 'BOT_kgDOCnlnWA', type: 'Bot'}],
        base: {sha: 'abc123'}
      }
    }

    const result = getContextPullRequestDetails()

    expect(result).toEqual({
      labels: ['login'],
      reviewers: [],
      baseSha: 'abc123'
    })
  })
})
