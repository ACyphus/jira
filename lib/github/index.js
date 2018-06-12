const issueComment = require('./issue-comment')
const issue = require('./issue')
const middleware = require('./middleware')
const push = require('./push')

module.exports = (robot) => {
  robot.on(['issue_comment.created', 'issue_comment.edited'], middleware(issueComment))

  robot.on(['issues.opened', 'issues.edited'], middleware(issue))

  robot.on(['push', 'pull_request'], middleware(push))
}
