#!/bin/bash
if [[ $0 =~ ^(.*)/[^/]+$ ]]; then
	WORKDIR=${BASH_REMATCH[1]}
fi
source ${WORKDIR}/mod.driver

# inputs
APIHOST="http://localhost"
if [[ -n "${EXPRESS_SERVER_PORT}" ]]; then
	APIHOST+=":${EXPRESS_SERVER_PORT}"
fi
ITEM="paths"
INPUTS=()

# apiPost
apiPost() {
	local URL="${1}"
	local BODY="${2}"
	local RESPONSE
	if [[ -n "${BODY}" ]]; then
		RESPONSE=$(curl -s -X POST \
			-H "Content-Type: application/json" \
			-d "${BODY}" \
		"${URL}")
	else
		RESPONSE=$(curl -s -X POST \
			-H "Content-Type: application/json" \
		"${URL}")
	fi
	printf "${RESPONSE}"
}

# run
run() {
	URL="${APIHOST}"
	URL+="/${ITEM}/clear"
	printf "[$(cgreen "INFO")]: api [$(cgreen "clear")] ${ITEM} [$(cgreen "${URL}")]... " 1>&2
	echo "[$(ccyan "DONE")]" 1>&2
	apiPost "${URL}"
}

# driver
driver "${@}"
