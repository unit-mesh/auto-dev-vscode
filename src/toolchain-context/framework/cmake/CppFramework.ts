export enum CppFrameworks {
	Qt = "Qt",
	Boost = "Boost"
}

export enum CppTestFrameworks {
	GoogleTest = "GoogleTest",
	Catch2 = "Catch2",
	GoogleMock = "GoogleMock"
}

export const CPP_PACKAGE: string = "cpp";

export const MOST_POPULAR_CPP_PACKAGES: Set<string> = new Set([
	"opencv",
	"boost",
	"protobuf",
	"gmock",
	"gtest",
	"asio",
	"cpprestsdk",
	"fmt",
	"rapidjson",
	"spdlog",
	"nlohmann/json",
	"mysqlcppconn",
	"sqlite3",
	"websocketpp",
	"zeromq",
	"cppzmq",
	"sdl2",
	"gtkmm",
	"wxwidgets",
	"fltk",
	"qt",
	"poco",
	"thrift",
	"grpc",
	"mongodb",
	"redis-plus-plus",
	"cpp_redis",
	"postgresql",
	"cpp-netlib",
	"cpprestsdk",
	"crow",
	"pistache"
]);
