# Build Theme

```shell
npx node-sass ./theme/site.scss ./theme/site.css
cp ./theme/site.css ./supplemental-ui/css/site.css
mv ./theme/site.css ./build/site/_/css/site.css
```

# Build antora site

```shell
npx antora --fetch antora-playbook.yml
```

# Preview

## Install

```shell
npm i -g http-server
```

## Run

```shell
http-server build/site -c-1 -p 8081
```