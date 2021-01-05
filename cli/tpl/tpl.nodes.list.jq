.items? |
if (length > 0) then map({
	"id": .id,
	"status": .status,
	"gridx": .grid.x,
	"gridy": .grid.y
}) else empty end
