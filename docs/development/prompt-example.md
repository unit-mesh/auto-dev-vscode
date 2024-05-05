---
layout: default
title: Prompt Example
nav_order: 999
---

```devin
Write unit test for following java code.
You are working on a project that uses Spring Boot,Spring Core,Spring MVC,JDBC,JPA  to build business logic.
 - lang.java.prompt.basicTestTemplate
// @startuml
// 'package cc.unitmesh.untitled.demo.entity
// 'javax.persistence.Entity
// 'javax.persistence.GeneratedValue
// 'javax.persistence.GenerationType
// 'javax.persistence.Id
// class BlogPost {
//   id: Long
//   title: String
//   content: String
//   author: String
//   +setId(): void
//   +getId(): Long
//   +getTitle(): String
//   +setTitle(): void
//   +getContent(): String
//   +setContent(): void
//   +getAuthor(): String
//   +setAuthor(): void
// }
// enduml
// 
Here is the source code to be tested:

```java
// imports: []
public BlogPost getBlogById(Long id) {
        return blogRepository.findById(id).orElse(null);
    }
```

Start getBlogById test code with Markdown code block here:
```