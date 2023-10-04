#!/bin/bash

PATH=$PATH:/usr/bin:/bin
PATH=$PATH:$HOME/.anyenv/bin
PATH=$PATH:$HOME/.joplin-bin/bin/
eval "$(anyenv init -)"

BASEDIR=$(dirname $0)
cd $BASEDIR/../

node .


