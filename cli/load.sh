#!/bin/bash

NODES=$(cat nodes.json | jq -c '.[]')

function loadNodes() {
	IFS=$'\n'
	COUNT=0
	for NODE in ${NODES}; do
		local GRIDX=$(printf ${NODE} | jq -r '.[0]')
		local GRIDY=$(printf ${NODE} | jq -r '.[1]')
		./cmd.nodes.create.sh "${GRIDX}:${GRIDY}" "${COUNT}"
		#sleep 1
		COUNT=$((COUNT+1))
	done
}

loadNodes
