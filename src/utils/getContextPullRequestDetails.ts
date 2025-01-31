import * as github from '@actions/github'

import type {GithubLabel, GithubReviewer} from '../types'
import type {ContextPullRequestDetails} from '../types'

/**
 * The pull request details from the context.
 *
 * @returns {ContextPullRequestDetails | null}
 * The pull request details that the application
 * requires.
 */
export function getContextPullRequestDetails(): ContextPullRequestDetails | null {
  const pullRequest = github.context.payload.pull_request

  if (typeof pullRequest === 'undefined') {
    return null
  }

  const labels = pullRequest.labels as GithubLabel[]
  const reviewers = pullRequest.requested_reviewers as GithubReviewer[]

  return {
    labels: labels.map(label => label.name),
    reviewers: reviewers.map(reviewer => reviewer.login),
    baseSha: pullRequest?.base?.sha
  }
}
