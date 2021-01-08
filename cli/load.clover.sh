#!/bin/bash

NODES=$(cat clover.json | jq -c '.nodes[]')
PATHS=$(cat clover.json | jq -c '.paths[]')

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
	for ROUTE in ${PATHS}; do
		local HOPS=($(printf ${ROUTE} | jq -r '.[]'))
		./cmd.paths.create.sh "${HOPS[@]}"
		COUNT=$((COUNT+1))
	done
}

## clear and load
./cmd.nodes.clear.sh
./cmd.paths.clear.sh
loadNodes
loadPaths
