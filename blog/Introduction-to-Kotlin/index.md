---
title: "Introduction to Kotlin"
tags: ["language", "programming", "kotlin", "tutorial"]
description: "Notes for kotlin"
author: "Aditya Singh"
date: "2021-06-29"
---
# Kotlin

- Kotlin is a statically typed programming language
- Officially supported language by Google for android

### Core features of Kotlin:

1. **Concise**: Reduces the amount of boilerplate code
2. **Safe:** Avoid NullPointerException
3. **Interoperable**: Use existing libraries of Java, Android, etc
4. **Tool friendly**: Use any existing IDE

### Hello world!

```kotlin
fun main() {
    println("Hello world!")
}
```

### Variables

```kotlin
...
val a = "Hello" //type inference
val a: Double = 23.44 
...
```

### val vs var

- val is value and var is variable
- val is nothing but a final value(like Java) which can not be reassigned.
- var can be reassigned.
- Can not change the type of a var. It is bounded by its defined type.
- We can use lateinit to initialise var later.

```kotlin
...
lateinit var a: String;
...

a = "Aditya"
...
```

- We can not set a null value to a var. We need to use ? operator. This is due to strong null safety check which comes attached with Kotlin.

```kotlin
...
var a: String? = null;
...
```

- To get a NPE for a var in Kotlin, we need to use !! operator. It makes sure that we receive NPE if it occurs.

```kotlin
...
var a: String? = null
...

val size: Int = a?.length!!  //throws NPE
```

- We have and elvis operator in Kotlin which is similar to conditional operator. (?:)

```kotlin
...
var a: String? = null
...

val size: Int = a?.length ?: 0   //returns 0 if a.length is null
```

- If we need to concatenate a string to another, there is a smart way to do it in kotlin

```kotlin
...
var a: String = "Aditya"
println(a + "Singh")    //prints Aditya Singh

println("$a Singh")     //prints Aditya Singh
...
```

### Arrays

- We can define array in following ways:

```kotlin
val a = arrayOf(1,2,3,4,"Aditya")   
/*
arrayOf() uses vararg underneath which tells that we can have n arguements 
inside a function.
*/
val a = arrayOf<Int>(1,2,3,4)
/*
This will bind our array with Int type. We cant add any other variable of any
other type inside it.
*/
val num = Array(5, {i -> i*1})    //0 1 2 3 4
/*
Using Array constructor
*/

println(a[3])
println(a.get(3))
```

### Collections

- By default in kotlin list is immutable

```kotlin
...
val myList = listOf<String>("Hello","World","Aditya")
...

myList.add("India")    //cant do that as there is no function add()
```

- If we want to add items we need to explicitly define it as mutable. We can use arrayListOf() also in place of mutableListOf().

```kotlin
...
val myList = mutableListOf<String>("Hello","World")
...

myList.add("Aditya")
```

- Maps are immutable.

```kotlin
...
val myMap = mapOf<Int,String>(1 to "Aditya", 2 to "Singh")
...

println(myMap[1])    //this will print "Aditya"

val myMap = mapOf(1 to "Aditya", "surname" to "Singh")   //to use different keys
```

- If we want mutable map, we use hash map.

```kotlin
...
val myMap = hashMapOf(1 to "Aditya", "surname" to "Singh")
...

myMap.set("country", "India")     //add a new key value pair
myMap["country"] = "India"        //we can do something like this as well
```

### Loops

- **Foreach** loops works with list, array, map. It iterates over the entire set of items and give the output.

```kotlin
val myList = listOf<String>("Hello","World","Aditya")

myList.forEach(it -> println(it))   //prints all items
```

- for loop

```kotlin
for (name in listOfNames) {
	println(name)           //print every item in list
}

for ( x in 0..10) {
	println(x)       //prints all value from 0 to 10 inclusive
}

for ( x in 0 until 10) {
	println(x)       //prints all value from 0 to 10, excludes 10
}

for ( x in 0 until 10 step 3) {
	println(x)       //prints 0 3 6 9
}

for ( x in 10 downTo 0 step 3) {
	println(x)       //prints 10 7 4 1
}
```

### Keywords

- `in` is check inclusiveness

### When

- It is similar to switch statement of C++. We dont iterate over all the condition like we do in if-else.

```kotlin
...
var a:String = "Aditya"

when(a) {
	"Aditya" -> {
		println("Aditya")     //will print this
	}
	"Singh" -> {
		println("Singh")
	}
	else {
		println("Other")
	}
}
...
```

- When can return a value as well.

### Functions

- The structure of functions is very similar to C++ or Java.

```kotlin
fun functionName(variable: Int): String {
	return "$variable was passed"
}
```

- Types of arguements:
    - **Positional arguments:** Arguments are passed in the order they are declared in the function definitions
    - **Default arguments:** There can be default values defined as an argument. We can choose not to pass it as a parameter. Function will pick up the default value.
    - **Named arguments:** These are special in kotlin. We can send parameter in any order, just specifying the name

    ```kotlin
    ...
    callFun(name="Aditya", age=22, company="Amazon")

    fun callFun(name: String, age: Int, company: String) {
    	//do something
    }
    ```

- If we are not sure of number of argument to pass, we can use *vararg.*

```kotlin
...
callFunction(1,2,3,4)

fun callFunction(vararg number: Int) {
	println(number.size)
	for(num in number) {
		prinln(num)
	}
}
...
```

### Class

- Similar to classes in C++

```kotlin
class User {
	var name: String = "Aditya"
	var age: Int = 22

	fun getAge(): Int {
		return age
	}
	fun assignValue(name:String, age: Int) {
		this.name = name
		this.age = age
	}
}
```

- *this* keyword is used to access members of current class. It points to the current class present in scope.
- Constructor are used to initialise the members of a class. There are 2 types of constructors:
    - Primary constructor (We can have only one primary constructor in a class)
    - Secondary constructor (We can have multiple secondary constructor in a class

```kotlin
class User(var name: String, var age: Int) {
	var name: String
	var age: Int

	fun getAge(): Int {
		return age
	}
	fun assignValue(name:String, age: Int) {
		this.name = name
		this.age = age
	}
}
...

val user = User("Aditya", 22)
```

- We can use init block as well as a constructor

```kotlin
class User(name: String, age: Int) {
	var name: String
	var age: Int
	init {
		name = name
		age = age
	}

	fun getAge(): Int {
		return age
	}
	fun assignValue(name:String, age: Int) {
		this.name = name
		this.age = age
	}
}
```

- There can be multiple secondary constructor.

```kotlin
class User(name: String, age: Int) {
	var name: String
	var age: Int
	constructor(name: String) {
		this.name = name
		age = 22
	}
	constructor(name: String, age: Int) {
		this.name = name
		this.age = age
	}
}
```

### Kotlin Java interoperability

- Kotlin is compiled as Java when present in backend java project.
- We can see the equivalent java code by following procedure:
    - We need to check the kotlin bytecode i.e. the code which machine understands
    - We can decompile the bytecode, which reverse engineers it java (source does'nt matter)
- No need to add getter and setter in kotlin, it automatically does that for us.