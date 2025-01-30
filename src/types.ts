import * as github from '@actions/github'
import type {WebhookPayload} from '@actions/github/lib/interfaces'
import type {Config} from './config'

export type Client = ReturnType<typeof github.getOctokit>

export interface GithubLabel {
  /**
   * The name of the label
   */
  name: string
}

export interface GithubReviewer {
  /**
   * The login for the user.
   */
  login: string
}

export type ReviewerStatus = 'success' | 'error' | 'info'

export interface AssignReviewersReturn {
  /**
   * The status of the assignment.
   */
  status: ReviewerStatus
  /**
   * Additional information about the action.
   */
  message: string
  /**
   * The url and the list of reviewers that are
   * assigned/unassigned.
   */
  data?: {url: string; reviewers: string[]}
}

export type ContextPullRequestDetails = {
  labels: string[]
  reviewers: string[]
  baseSha: string
}

export interface Options {
  /**
   * The client to perform actions on github.
   */
  client: Client
  /**
   * The labels and the reviewers that belong to
   * each label.
   */
  labelReviewers: Config['assign']
  /**
   * The pull request details required.
   */
  contextDetails: ContextPullRequestDetails
  /**
   * The webhook payload.
   */
  contextPayload: WebhookPayload
  /**
   * The Labels that come from the PR
   */
  inputLabels: string[]
}
