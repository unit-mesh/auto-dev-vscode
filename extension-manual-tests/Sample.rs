// 1. 常量与变量
const PI: f64 = 3.14159;
let mut x = 5;  // 可变变量
x = 6;

// 2. 基本数据类型
let integer: i32 = 42;
let float: f64 = 3.14;
let boolean: bool = true;
let character: char = 'R';
let tuple: (i32, f64, char) = (42, 3.14, 'R');
let array: [i32; 3] = [1, 2, 3];

// 3. 函数与返回值
fn add(a: i32, b: i32) -> i32 {
    a + b
}

let sum = add(5, 10);

// 4. 控制流
if sum > 10 {
    println!("Sum is greater than 10");
} else {
    println!("Sum is 10 or less");
}

for i in 0..5 {
    println!("i = {}", i);
}

let mut counter = 0;
while counter < 5 {
    println!("counter = {}", counter);
    counter += 1;
}

// 5. 所有权与借用
fn take_ownership(s: String) {
    println!("Took ownership of: {}", s);
}

fn borrow_string(s: &String) {
    println!("Borrowed string: {}", s);
}

let s = String::from("Hello, Rust!");
take_ownership(s);  // s 的所有权被转移，s 不再有效
// borrow_string(&s); // 这一行会报错，因为 s 的所有权已被转移

let s2 = String::from("Hello again!");
borrow_string(&s2); // s2 的所有权未被转移

// 6. 结构体
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

let rect = Rectangle { width: 30, height: 50 };
println!("The area of the rectangle is {} square pixels.", rect.area());

// 7. 枚举与模式匹配
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn process_message(msg: Message) {
    match msg {
        Message::Quit => println!("Quit"),
        Message::Move { x, y } => println!("Move to x: {}, y: {}", x, y),
        Message::Write(text) => println!("Text message: {}", text),
        Message::ChangeColor(r, g, b) => println!("Change color to red: {}, green: {}, blue: {}", r, g, b),
    }
}

let msg = Message::Write(String::from("Hello, enums!"));
process_message(msg);

// 8. 错误处理
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err(String::from("Division by zero"))
    } else {
        Ok(a / b)
    }
}

match divide(10.0, 2.0) {
    Ok(result) => println!("Result: {}", result),
    Err(e) => println!("Error: {}", e),
}

// 9. 泛型与 trait
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list.iter() {
        if item > largest {
            largest = item;
        }
    }
    largest
}

let numbers = vec![34, 50, 25, 100, 65];
println!("The largest number is {}", largest(&numbers));

trait Summary {
    fn summarize(&self) -> String;
}

struct Article {
    title: String,
    content: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{}: {}", self.title, &self.content[..20])
    }
}

let article = Article {
    title: String::from("Rust Programming"),
    content: String::from("Rust is a systems programming language focused on safety, speed, and concurrency."),
};

println!("New article available! {}", article.summarize());
