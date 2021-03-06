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
echo "APIHOST [${APIHOST}]" 1>&2
ITEM="paths"
INPUTS=()

# makeBody - validate input
makeBody() {
	local LIST=$(makeJoin "${@}")
	read -r -d "" BODY <<-EOF
	{
		"route": [ ${LIST} ]
	}
	EOF
	printf "${BODY}"
}

# apiPost
apiPost() {
	local URL="${1}"
	local BODY="${2}"
	local RESPONSE=$(curl -s -X POST \
		-H "Content-Type: application/json" \
		-d "${BODY}" \
	"${URL}")
	printf "${RESPONSE}"
}

# run
run() {
	URL="${APIHOST}"
	URL+="/${ITEM}"
	local BODY=$(makeBody "${@}")
	if [[ -n "${BODY}" ]]; then
		printf "[$(cgreen "INFO")]: api [$(cgreen "create")] ${ITEM} [$(cgreen "${URL}")]... " 1>&2
		echo "[$(ccyan "DONE")]" 1>&2
		apiPost "${URL}" "${BODY}"
	else
		echo "[$(corange "ERROR")]: command usage: [$(ccyan " paths.create <path.src> <path.dst> ")] " 1>&2
	fi
}

# driver
driver "${@}"
