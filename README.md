# Assign Reviewers By Labels

Automatically assign reviewers to pull requests using labels.

The standard version of this project works well when executed after label / unlabel GH hooks. However, some projects need the reviewers to be added as part of the PR creation (Open / Re-Open) process (hooks). Thus, if you have on your flow other actions that add labels to the PR and just add the standard GHA to your project, it won't pick up (identify) the labels added during the flow execution.

## Usage

### Add a `.github/assign_label_reviewers.yml` file

To assign reviewers using labels, provide an object with the **key as the label** and the **value as an array of reviewers**.

```yml
assign:
  login: ['ljbc1994', 'reviewer2', 'reviewer3']
  signup: ['reviewer4', 'reviewer5']
  dashboard: ['ljbc1994', 'reviewer6']
```

### Create Workflow

Create a workflow in your repository, you only need to trigger the workflow when a label has been added or removed:

#### Basic Workflow

```yml
name: "Pull Request Label Reviewers"
on:
  pull_request:
    types:
      - unlabeled
      - labeled

jobs:
  assign_and_unassign:
    name: assign and unassign reviewers
    runs-on: ubuntu-latest
    steps:
      - name: main
        id: assign-reviewers
        uses: totallymoney/assign-reviewers-by-labels-action@v1
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
```

#### Advanced Workflow

```yml
name: "Pull Request Label Reviewers"
on:
  pull_request:
    types:
      - unlabeled
      - labeled

jobs:
  assign_and_unassign:
    name: assign and unassign reviewers
    runs-on: ubuntu-latest
    steps:
      - name: main
        id: assign_reviewers
        uses: totallymoney/assign-reviewers-by-labels-action@v1
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
      - name: assigned reviewers
        if: steps.assign_reviewers.outputs.assigned_status == 'success'
        run: |
          echo "reviewers assigned: ${{ steps.reviewer.outputs.assigned_reviewers }}"
      - name: unassigned reviewers
        if: steps.assign_reviewers.outputs.unassigned_status == 'success'
        run: |
          echo "reviewers unassigned: ${{ steps.reviewer.outputs.unassigned_reviewers }}"
```

## Inputs ➡️ Outputs

### Action inputs

| Name | Description | Required | Default
| - | - | - | - | 
| `repo-token` | Token to use to authorize label changes. Typically the GITHUB_TOKEN secret, with `contents:read` and `pull-requests:write` access | `true` | N/A
| `unassign-if-label-removed` | Whether to unassign reviewers that belong to a label if the label has been removed  | `true` | `true`
| `config-file` | The path to the label configuration file or endpoint that returns JSON configuration file | `false` | `.github/assign_label_reviewers.yml`
| `config-request-headers` | The headers to be passed when calling an endpoint to return the JSON configuration file | `false` | N/A
| `input-labels` | A list of labels that should be used as the input for this action. This is useful when you want to use the action as part of the Github Open / Re-open process, after other actions have already been executed to add labels to the PR. Example of value: '["label","label2","label3"]' | `false` | null

### Action outputs

| Name | Description 
| - | - |
| `assigned_status` | Whether reviewers have been assigned (`success` / `info`) 
| `assigned_message` | Additional details of the status
| `assigned_url` | The url of the PR 
| `assigned_reviewers` | The reviewers that have been assigned
| `unassigned_status` | Whether reviewers have been unassigned (`success` / `info`) 
| `unassigned_message` | Additional details of the status
| `unassigned_url` | The url of the PR
| `unassigned_reviewers` | The reviewers that have been unassigned

## Examples

### Using a remote config

If you want to retrieve the config from an endpoint, we also support this.

Please note:

- We only allow retrieving the config using a `GET` request with the ability to pass through custom headers if you need to pass an api token (`config-request-headers`).
- The endpoint **MUST** return the config in the `JSON` format.

#### Example Config

```json
{
  "assign": {
    "login": ["ljbc1994", "reviewer2", "reviewer3"]
  }
}
```

### Using a list of Labels as Input

This fork add the ability to use a list of labels as the input to the action. If a the parameter `input-labels` is provided, then these labels are used as the source to have the reviewers added to the PR.

#### Example of valid input-label:
'["label","label2","label3"]'



#### Example Workflow

```yml
name: "Pull Request Label Reviewers"
on:
  pull_request:
    types:
      - unlabeled
      - labeled

jobs:
  assign_and_unassign:
    name: assign and unassign reviewers
    runs-on: ubuntu-latest
    steps:
      - name: main
        id: assign_reviewers
        uses: totallymoney/assign-reviewers-by-labels-action@v1
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
          config-file: 'https://www.totallymoney.com/assign-reviewers-label-config.json'
          config-request-headers: '{"Authorization": "Bearer ${{ secrets.API_TOKEN }}"}'
          input-labels: ${{ needs.previousjob.outputs.labels }}
```