using System;
using System.Collections.Generic;
using System.Linq;

namespace ComprehensiveCSharpExample
{
    // 1. 枚举
    enum Direction { North, South, East, West }

    // 2. 接口
    interface IDrawable
    {
        void Draw();
    }

    // 3. 结构体
    struct Point
    {
        public int X { get; }
        public int Y { get; }

        public Point(int x, int y)
        {
            X = x;
            Y = y;
        }
    }

    // 4. 类与继承、多态
    class Shape
    {
        public virtual double Area() => 0.0;
    }

    class Circle : Shape
    {
        public double Radius { get; }

        public Circle(double radius)
        {
            Radius = radius;
        }

        public override double Area() => Math.PI * Radius * Radius;
    }

    class Square : Shape, IDrawable
    {
        public double Side { get; }

        public Square(double side)
        {
            Side = side;
        }

        public override double Area() => Side * Side;

        public void Draw()
        {
            Console.WriteLine($"Drawing a square with side {Side}");
        }
    }

    // 5. 泛型类
    class Box<T>
    {
        public T Value { get; }

        public Box(T value)
        {
            Value = value;
        }
    }

    class Program
    {
        // 6. 委托与事件
        public delegate void Notify(string message);
        public static event Notify OnNotify;

        static void Main(string[] args)
        {
            // 7. 变量与数据类型
            int number = 42;
            double pi = 3.14159;
            bool isTrue = true;
            char letter = 'C';
            string text = "Hello, C#!";

            Console.WriteLine($"Number: {number}, Pi: {pi}, IsTrue: {isTrue}, Letter: {letter}, Text: {text}");

            // 8. 控制流
            if (number > 40)
            {
                Console.WriteLine("Number is greater than 40");
            }
            else
            {
                Console.WriteLine("Number is 40 or less");
            }

            for (int i = 0; i < 5; i++)
            {
                Console.WriteLine($"i = {i}");
            }

            int counter = 0;
            while (counter < 5)
            {
                Console.WriteLine($"Counter = {counter}");
                counter++;
            }

            // 9. 函数调用
            int sum = Add(10, 20);
            Console.WriteLine($"Sum: {sum}");

            // 10. 枚举使用
            Navigate(Direction.East);

            // 11. 类与对象
            Circle circle = new Circle(5.0);
            Square square = new Square(4.0);
            Console.WriteLine($"Circle Area: {circle.Area()}");
            Console.WriteLine($"Square Area: {square.Area()}");
            square.Draw();

            // 12. 结构体
            Point point = new Point(10, 20);
            Console.WriteLine($"Point coordinates: X = {point.X}, Y = {point.Y}");

            // 13. 泛型
            Box<int> intBox = new Box<int>(123);
            Box<string> stringBox = new Box<string>("Generics in C#");
            Console.WriteLine($"Int Box: {intBox.Value}");
            Console.WriteLine($"String Box: {stringBox.Value}");

            // 14. 集合与 LINQ
            List<int> numbers = new List<int> { 1, 2, 3, 4, 5 };
            var doubled = numbers.Select(n => n * 2);
            var filtered = numbers.Where(n => n > 3);

            Console.WriteLine("Doubled numbers: " + string.Join(", ", doubled));
            Console.WriteLine("Filtered numbers: " + string.Join(", ", filtered));

            // 15. 异常处理
            try
            {
                int result = Divide(10, 0);
                Console.WriteLine($"Result: {result}");
            }
            catch (DivideByZeroException e)
            {
                Console.WriteLine("Error: " + e.Message);
            }

            // 16. 事件触发
            OnNotify += MessageHandler;
            OnNotify?.Invoke("This is a notification message.");
        }

        // 17. 函数
        static int Add(int a, int b) => a + b;

        // 18. 异常处理函数
        static int Divide(int a, int b)
        {
            if (b == 0) throw new DivideByZeroException("Cannot divide by zero");
            return a / b;
        }

        // 19. 枚举与 switch 语句
        static void Navigate(Direction direction)
        {
            switch (direction)
            {
                case Direction.North:
                    Console.WriteLine("Going North");
                    break;
                case Direction.South:
                    Console.WriteLine("Going South");
                    break;
                case Direction.East:
                    Console.WriteLine("Going East");
                    break;
                case Direction.West:
                    Console.WriteLine("Going West");
                    break;
            }
        }

        // 20. 事件处理函数
        static void MessageHandler(string message)
        {
            Console.WriteLine($"Received message: {message}");
        }
    }
}
