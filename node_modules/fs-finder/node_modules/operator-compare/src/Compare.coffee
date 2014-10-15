module.exports = (left, operator, right) ->
	switch operator
		when '>' then return left > right
		when '>=' then return left >= right
		when '<' then return left < right
		when '<=' then return left <= right
		when '=', '==' then return left == right
		when '!', '!=', '<>' then return left != right
		else throw new Error 'Unknown operator ' + operator + '.', '^.'