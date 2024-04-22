export interface SpringDataLibraryDescriptor {
	shortText: string;
	coords: string[];
}

export interface LibraryDescriptor {
	shortText: string;
	coord: string;
}

export class SpringLibrary {
	private static REACTOR_MAVEN: string = "io.projectreactor:reactor-core";
	private static MONGO_REACTIVE_STREAMS_MAVEN: string = "org.mongodb:mongodb-driver-reactivestreams";
	private static JPA_MAVEN: string = "org.springframework.data:spring-data-jpa";
	private static CASSANDRA_MAVEN: string = "org.springframework.data:spring-data-cassandra";
	private static COUCHBASE_MAVEN: string = "org.springframework.data:spring-data-couchbase";
	private static JDBC_MAVEN: string = "org.springframework.data:spring-data-jdbc";
	private static MONGO_MAVEN: string = "org.springframework.data:spring-data-mongodb";
	private static NEO4J_MAVEN: string = "org.springframework.data:spring-data-neo4j";
	private static R2DBC_MAVEN: string = "org.springframework.data:spring-data-r2dbc";
	private static REDIS_MAVEN: string = "org.springframework.data:spring-data-redis";

	public static SPRING_DATA: SpringDataLibraryDescriptor[] = [
		{ shortText: "JPA ", coords: [SpringLibrary.JPA_MAVEN] },
		{ shortText: "CASSANDRA", coords: [SpringLibrary.CASSANDRA_MAVEN] },
		{ shortText: "REACTIVE CASSANDRA", coords: [SpringLibrary.CASSANDRA_MAVEN, SpringLibrary.REACTOR_MAVEN] },
		{ shortText: "COUCHBASE", coords: [SpringLibrary.COUCHBASE_MAVEN] },
		{ shortText: "REACTIVE COUCHBASE", coords: [SpringLibrary.COUCHBASE_MAVEN, SpringLibrary.REACTOR_MAVEN] },
		{ shortText: "JDBC", coords: [SpringLibrary.JDBC_MAVEN] },
		{ shortText: "MONGO", coords: [SpringLibrary.MONGO_MAVEN] },
		{
			shortText: "REACTIVE MONGO",
			coords: [SpringLibrary.MONGO_MAVEN, SpringLibrary.REACTOR_MAVEN, SpringLibrary.MONGO_REACTIVE_STREAMS_MAVEN]
		},
		{ shortText: "NEO4J", coords: [SpringLibrary.NEO4J_MAVEN] },
		{ shortText: "R2DBC", coords: [SpringLibrary.R2DBC_MAVEN] },
		{ shortText: "REDIS", coords: [SpringLibrary.REDIS_MAVEN] }
	];

	public static SPRING_MVC: LibraryDescriptor[] = [
		{ shortText: "Spring MVC", coord: "org.springframework:spring-webmvc" },
		{ shortText: "Spring Core", coord: "org.springframework:spring-core" },
		{ shortText: "Spring Boot", coord: "org.springframework.boot:spring-boot" },
		{ shortText: "Spring WebFlux", coord: "org.springframework:spring-webflux" }
	];
}
