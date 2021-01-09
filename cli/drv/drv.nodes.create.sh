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
ITEM="nodes"
INPUTS=()

# makeBody - validate input
makeBody() {
	local CELL="${1}"
	local TAGS="${2}"
	if [[ ${CELL} =~ ^([0-9]+)[:]([0-9]+)$ ]]; then
		local GRIDX="${BASH_REMATCH[1]}"
		local GRIDY="${BASH_REMATCH[2]}"
		read -r -d "" BODY <<-EOF
		{
			"grid": {
				"x": ${GRIDX},
				"y": ${GRIDY}
			},
			"tags": []
		}
		EOF
		if [[ -n ${TAGS} ]]; then
			BODY=$(echo "${BODY}" | jq -r ". | .tags += [\"${TAGS}\"]")
		fi
		printf "${BODY}"
	fi
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
		printf "[$(cgreen "INFO")]: api [$(cgreen "list")] ${ITEM} [$(cgreen "${URL}")]... " 1>&2
		echo "[$(ccyan "DONE")]" 1>&2
		apiPost "${URL}" "${BODY}"
	else
		echo "[$(corange "ERROR")]: command usage: [$(ccyan " nodes.create <node.pos> ")] " 1>&2
	fi
}

# driver
driver "${@}"
