# operator-compare

Comparing two variables with operator as argument.

## Changelog

Changelog is in the bottom of this readme.

## Usage

```
var compare = require('compare');

compare(5, '<', 10);			// result: true
```

As you can see, this is just simple function, which compare two variables by operator as second argument. List of available
operators is bellow.

## Operators

There are just classic operators with some others.

```
   Operator   |   Equivalent
--------------+----------------
      >       |          >
      >=      |          >=
      <       |          <
      <=      |          <=
     =, ==    |         ===
   !, !=, <>  |         !==
```

Last two lines are sets of operators, so operator `<>` is the same one as `!=`.

If you will try to set some unknown operator, exception will be thrown.

## Changelog

* 1.1.1
	+ Typo in readme

* 1.0.0
	+ Initial commit