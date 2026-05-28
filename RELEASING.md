# Releasing nodehive-js

Releases are published automatically by GitHub Actions when a GitHub Release
is published. The workflow uses npm's Trusted Publisher (OIDC), so no npm
tokens are involved — every publish runs with provenance and is signed by
GitHub.

Two release types, distinguished by the GitHub Release "pre-release" flag:

| Type    | Version example   | dist-tag  | Installed by                  |
|---------|-------------------|-----------|-------------------------------|
| Beta    | `2.0.0-beta.12`   | `beta`    | `npm i nodehive-js@beta`      |
| Stable  | `2.0.0`           | `latest`  | `npm i nodehive-js`           |

## Make a beta release

```bash
# 1. Bump version in package/package.json (no git tag yet)
cd package
npm version 2.0.0-beta.13 --no-git-tag-version
cd ..

# 2. Commit + create annotated tag
git add package/package.json package/package-lock.json
git commit -m "chore: bump version to 2.0.0-beta.13"
git tag -a v2.0.0-beta.13 -m "v2.0.0-beta.13"
git push --follow-tags

# 3. Create a GitHub pre-release (triggers the publish workflow)
gh release create v2.0.0-beta.13 --generate-notes --prerelease
```

## Make a stable release

Same flow, but **without** `--prerelease` and with a stable version number:

```bash
cd package
npm version 2.1.0 --no-git-tag-version
cd ..

git add package/package.json package/package-lock.json
git commit -m "chore: bump version to 2.1.0"
git tag -a v2.1.0 -m "v2.1.0"
git push --follow-tags

gh release create v2.1.0 --generate-notes
```

## After triggering a release

The workflow waits in the `npm-publish` environment for a manual approval
(GitHub Actions tab → "Review pending deployments" → Approve). Once approved,
the package is built and published. Status:

```bash
gh run list --workflow=publish.yml --limit 1
npm view nodehive-js dist-tags
```

## Notes

- The workflow validates that the tag matches the version in `package.json`
  and that the tag is prefixed with `v`. Mismatched tags fail fast.
- Versions are immutable on npm — once published, a version number is burnt
  forever, even after `npm unpublish` (which only works within 72h).
- Manual `npm publish` is no longer needed and would fail anyway, since the
  package is configured to require OIDC publishing via the trusted publisher.
