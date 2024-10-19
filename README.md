# Build Theme

```shell
npx node-sass ./theme/site.scss ./theme/site.css
mv ./theme/site.css ./supplemental-ui/css/site.css
```

# Build antora site

```shell
npx antora --fetch antora-playbook.yml
```