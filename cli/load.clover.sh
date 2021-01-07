#!/bin/bash

NODES=$(cat clover.json | jq -c '.nodes[]')
#PATHS=$(cat model.json | jq -c '.paths[]')

function loadNodes() {
	IFS=$'\n'
	COUNT=0
	for NODE in ${NODES}; do
		local GRIDX=$(printf ${NODE} | jq -r '.[0]')
		local GRIDY=$(printf ${NODE} | jq -r '.[1]')
		./cmd.nodes.create.sh "${GRIDX}:${GRIDY}" "${COUNT}"
		COUNT=$((COUNT+1))
	done
}

function loadPaths() {
	IFS=$'\n'
	COUNT=0
	for LINK in ${PATHS}; do
		local LINKSRC=$(printf ${LINK} | jq -r '.[0]')
		local LINKDST=$(printf ${LINK} | jq -r '.[1]')
		./cmd.paths.create.sh "${LINKSRC}" "${LINKDST}"
		COUNT=$((COUNT+1))
	done
}

loadNodes
#loadPaths
