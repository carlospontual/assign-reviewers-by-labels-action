import type {AssignReviewersReturn, Client} from '../types'
import {setReviewersAsync} from './setReviewersAsync'
import {Options} from '../types'

/**
 * Determine the reviewers that should be removed
 * depending on the state of the PR. Then, request
 * to remove those reviewers from the PR.
 *
 * @param {Options} options
 * @returns {Promise<AssignReviewersReturn}
 * The status of whether the reviewers were unassigned
 * as well as data containing those reviewers.
 */
export async function unassignReviewersAsync({
  client,
  labelReviewers,
  contextDetails,
  contextPayload,
  inputLabels
}: Options): Promise<AssignReviewersReturn> {
  if (contextDetails == null) {
    return {
      status: 'error',
      message: 'No action context'
    }
  }

  const labels = Object.keys(labelReviewers)

  const reviewersByLabelInclude: string[] = []
  const reviewersByLabelMiss: string[] = []

  for (const label of labels) {
    if (!inputLabels.includes(label)) {
      reviewersByLabelMiss.push(...labelReviewers[label])
    } else {
      reviewersByLabelInclude.push(...labelReviewers[label])
    }
  }

  if (reviewersByLabelMiss.length === 0) {
    return {
      status: 'info',
      message: 'No reviewers to unassign'
    }
  }

  let reviewersToUnassign: string[] = []

  if (inputLabels.length === 0) {
    reviewersToUnassign = [
      ...new Set([...reviewersByLabelMiss, ...reviewersByLabelInclude])
    ]
  } else {
    reviewersToUnassign = reviewersByLabelMiss.filter(
      reviewer => !reviewersByLabelInclude.includes(reviewer)
    )
  }

  if (reviewersToUnassign.length === 0) {
    return {
      status: 'info',
      message: 'No reviewers to unassign'
    }
  }

  const result = await setReviewersAsync({
    client,
    reviewers: reviewersToUnassign,
    contextPayload,
    action: 'unassign'
  })

  if (result == null) {
    return {
      status: 'info',
      message: 'No reviewers to unassign'
    }
  }

  return {
    status: 'success',
    message: 'Reviewers have been unassigned',
    data: {url: result.url, reviewers: reviewersToUnassign}
  }
}
