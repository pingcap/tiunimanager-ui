# Contributing to TiUniManager UI

Thanks for your interest in contributing to TiUniManager UI! As a contributor, here are the guidelines we would like you to follow:

- [Code of Conduct](#coc)
- [Question or Problem?](#question)
- [Bugs](#issue)
- [Submission Guidelines](#submit)
- [Commit Message Guidelines](#commit)
- [Signing the CLA](#cla)

## <a name="coc"></a> Code of Conduct

Help us keep TiUniManager UI open and inclusive. Please read and follow our [Code of Conduct][coc].

## <a name="question"></a> Got a Question or Problem?

Do not open issues for general support questions as we want to keep GitHub issues for bug reports. Instead, we recommend using [Github Discussions][discussions] to ask support-related questions.

For Chinese users, you can also reach out via the PingCAP official user forum [AskTUG][asktug].

## <a name="issue"></a> Found a Bug?

If you find a bug in the source code, you can help us by [submitting an issue](#submit-issue) to our [GitHub Repository][github]. Even better, you can [submit a Pull Request](#submit-pr) with a fix.

## <a name="submit"></a> Submission Guidelines

### <a name="submit-issue"></a> Submitting an Issue

Before you submit an issue, please search the issue tracker. An issue for your problem might already exist and the discussion might inform you of workarounds readily available.

We want to fix all the issues as soon as possible, but before fixing a bug, we need to reproduce and confirm it. In order to locate bugs, we require that you provide clear steps to reproduce bugs and screenshots if applicable.

Unfortunately, we are not able to investigate / fix bugs without clear steps to reproduce the behavior, so if we don't hear back from you, we are going to close an issue that doesn't have enough info to be reproduced.

You can file new issues by selecting from our [new issue templates][issue-template] and filling out the issue template.

### <a name="submit-pr"></a> Submitting a Pull Request (PR)

Before you submit your Pull Request (PR) consider the following guidelines:

1. Search [GitHub][pr] for an open or closed PR that relates to your submission. You don't want to duplicate existing efforts.

2. Be sure that an issue describes the problem you're fixing. Discussing the design upfront helps to ensure that we're ready to accept your work.

3. Please sign our [Contributor License Agreement (CLA)](#cla) after sending PRs. We cannot accept code without a signed CLA. Make sure you author all contributed Git commits with email address associated with your CLA signature.

4. [Fork][fork-help] this [repository][github].

5. In your forked repository, make your changes in a new git branch:

   ```shell
   git checkout -b fix/your-fixed-module master
   ```

6. Create your patch, **including appropriate test cases if applicable**.

7. Commit your changes using a descriptive commit message that follows our [commit message conventions](#commit).

8. Push your branch to GitHub:

   ```shell
   git push origin fix/your-fixed-module
   ```

9. In GitHub, send a pull request to `tiunimanager-ui:master`.

### Reviewing a Pull Request

The TiUniManager UI team reserves the right not to accept pull requests from community members who haven't been good citizens of the community. Such behavior includes not following the [Code of Conduct](./CODE_OF_CONDUCT.md) and applies within or outside our managed channels.

#### Addressing review feedback

If we ask for changes via code reviews then:

1. Make the required updates to the code.

2. Create a commit and push to your GitHub repository (this will update your Pull Request):

   ```shell
   git commit --all HEAD
   git push
   ```

That's it! Thank you for your contribution!

##### Updating the commit message

A reviewer might often suggest changes to a commit message (for example, to add more context for a change or adhere to our [commit message guidelines](#commit)).
In order to update the commit message of the last commit on your branch:

1. Check out your branch:

   ```shell
   git checkout fix/your-fixed-module
   ```

2. Amend the last commit and modify the commit message:

   ```shell
   git commit --amend
   ```

3. Push to your GitHub repository:

   ```shell
   git push --force-with-lease
   ```

> NOTE:
>
> If you need to update the commit message of an earlier commit, you can use `git rebase` in interactive mode.
> See the [git docs][git-rebase-doc] for more details.

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes from the upstream repository:

- Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

  ```shell
  git push origin --delete fix/your-fixed-module
  ```

- Check out the master branch:

  ```shell
  git checkout master -f
  ```

- Delete the local branch:

  ```shell
  git branch -D fix/your-fixed-module
  ```

- Update your local `master` with the latest upstream version:

  ```shell
  git pull --ff upstream master
  ```

## <a name="commit"></a> Commit Message Format

> _This specification is inspired by the [Angular commit message format][commit-message-format]._

We have very precise rules over how our Git commit messages must be formatted.
This format leads to **easier to read commit history**.

Each commit message consists of a **header**, a **body**, and a **footer**.

```
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The `header` is mandatory and must conform to the [Commit Message Header](#commit-header) format.

The `body` is optional. When the body is present it must be at least 20 characters long and must conform to the [Commit Message Body](#commit-body) format.

The `footer` is optional. The [Commit Message Footer](#commit-footer) format describes what the footer is used for and the structure it must have.

#### <a name="commit-header"></a>Commit Message Header

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: hooks|store|cluster|resources|...
  │
  └─⫸ Commit Type: build|chore|feat|fix|refactor|...
```

The `<type>` and `<summary>` fields are mandatory, the `(<scope>)` field is optional.

##### Type

Suggested types:

- **chore**: Miscellaneous changes like (example: .env, .eslintrc, git hooks)
- **build**: Changes that affect the build system or external dependencies (example scopes: vite, esbuild, npm)
- **ci**: Changes to our CI configuration files and scripts
- **docs**: Documentation only changes
- **feat**: A new feature
- **fix**: A bug fix
- **perf**: A code change that improves performance
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests

Other types are up to your discretion.

##### Scope

The scope scope could be anything specifying the place of the commit chang.

For example, `hooks`, `store`, `components`, `api/model`, `cluster`, `user/password` etc...

##### Summary

Use the summary field to provide a succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize the first letter
- no dot (.) at the end

#### <a name="commit-body"></a>Commit Message Body

Just as in the summary, use the imperative, present tense: "fix" not "fixed" nor "fixes".

Explain the motivation for the change in the commit message body. This commit message should explain _why_ you are making the change.
You can include a comparison of the previous behavior with the new behavior in order to illustrate the impact of the change.

#### <a name="commit-footer"></a>Commit Message Footer

The footer can contain information about breaking changes and deprecations and is also the place to reference GitHub issues, Jira tickets, and other PRs that this commit closes or is related to. For example:

```
BREAKING CHANGE: <breaking change summary>
<BLANK LINE>
<breaking change description + migration instructions>
<BLANK LINE>
<BLANK LINE>
Fixes #<issue number>
```

or

```
DEPRECATED: <what is deprecated>
<BLANK LINE>
<deprecation description + recommended update path>
<BLANK LINE>
<BLANK LINE>
Closes #<pr number>
```

Breaking Change section should start with the phrase "BREAKING CHANGE: " followed by a summary of the breaking change, a blank line, and a detailed description of the breaking change that also includes migration instructions.

Similarly, a Deprecation section should start with "DEPRECATED: " followed by a short description of what is deprecated, a blank line, and a detailed description of the deprecation that also mentions the recommended update path.

### Revert commits

If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit.

The content of the commit message body should contain:

- information about the SHA of the commit being reverted in the following format: `This reverts commit <SHA>`,
- a clear description of the reason for reverting the commit message.

## <a name="cla"></a> Signing the CLA

After sending pull requests, you can find our Contributor License Agreement (CLA) entrance in your PR's comments. Please Visit the link and click the **Sign in with GitHub to agree** button to sign the CLA. For any code changes to be accepted, the CLA must be signed.

[coc]: CODE_OF_CONDUCT.md
[discussions]: https://github.com/pingcap-inc/tiunimanager-ui/discussions
[asktug]: https://asktug.com/c/administration/TiDB
[github]: https://github.com/pingcap-inc/tiunimanager-ui
[issue-template]: https://github.com/pingcap-inc/tiunimanager-ui/issues/new/choose
[pr]: https://github.com/pingcap-inc/tiunimanager-ui/pulls
[fork-help]: https://docs.github.com/en/github/getting-started-with-github/fork-a-repo
[git-rebase-doc]: https://git-scm.com/docs/git-rebase#_interactive_mode
[commit-message-format]: https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format
