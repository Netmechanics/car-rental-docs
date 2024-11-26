#!/bin/bash

npx node-sass ./theme/site.scss ./theme/site.css
cp ./theme/site.css ./supplemental-ui/css/site.css
mv ./theme/site.css ./build/site/_/css/site.css