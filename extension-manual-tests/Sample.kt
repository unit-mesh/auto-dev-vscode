// 1. 变量与常量
val pi: Double = 3.14159  // 常量 (不可变)
var x: Int = 5  // 变量 (可变)
x = 6

// 2. 基本数据类型与字符串模板
val integer: Int = 42
val float: Float = 3.14f
val boolean: Boolean = true
val character: Char = 'K'
val string: String = "Hello, Kotlin!"
println("Integer: $integer, Float: $float, Boolean: $boolean, Character: $character, String: $string")

// 3. 函数与默认参数
fun add(a: Int, b: Int = 10): Int {
    return a + b
}

val sum = add(5)
println("Sum: $sum")

// 4. 控制流
if (sum > 10) {
    println("Sum is greater than 10")
} else {
    println("Sum is 10 or less")
}

for (i in 0..4) {
    println("i = $i")
}

var counter = 0
while (counter < 5) {
    println("Counter = $counter")
    counter++
}

// 5. 类与对象
class Rectangle(val width: Int, val height: Int) {
    fun area(): Int {
        return width * height
    }
}

val rect = Rectangle(30, 50)
println("The area of the rectangle is ${rect.area()} square pixels.")

// 6. 继承与抽象类
abstract class Shape {
    abstract fun area(): Double
}

class Circle(val radius: Double) : Shape() {
    override fun area(): Double {
        return pi * radius * radius
    }
}

val circle = Circle(5.0)
println("The area of the circle is ${circle.area()} square units.")

// 7. 接口
interface Drawable {
    fun draw()
}

class Square(val side: Int) : Drawable {
    override fun draw() {
        println("Drawing a square with side $side")
    }
}

val square = Square(10)
square.draw()

// 8. 数据类与解构
data class Point(val x: Int, val y: Int)

val point = Point(10, 20)
val (xCoord, yCoord) = point
println("Point coordinates: x = $xCoord, y = $yCoord")

// 9. 枚举
enum class Direction {
    NORTH, SOUTH, EAST, WEST
}

fun navigate(direction: Direction) {
    when (direction) {
        Direction.NORTH -> println("Going North")
        Direction.SOUTH -> println("Going South")
        Direction.EAST -> println("Going East")
        Direction.WEST -> println("Going West")
    }
}

navigate(Direction.EAST)

// 10. 集合与集合操作
val numbers = listOf(1, 2, 3, 4, 5)
val doubled = numbers.map { it * 2 }
val filtered = numbers.filter { it > 3 }
println("Numbers: $numbers")
println("Doubled: $doubled")
println("Filtered: $filtered")

// 11. 异常处理
fun divide(a: Int, b: Int): Int {
    return try {
        a / b
    } catch (e: ArithmeticException) {
        println("Error: Division by zero")
        0
    }
}

val result = divide(10, 0)
println("Result: $result")

// 12. 泛型
class Box<T>(val item: T) {
    fun getItem(): T {
        return item
    }
}

val intBox = Box(123)
val stringBox = Box("Hello, Generics!")
println("Int Box: ${intBox.getItem()}")
println("String Box: ${stringBox.getItem()}")
