---
layout: default
title: Now
---

<div class="posts">
  {% for post in site.posts %}
    {% if post.layout == "now" %}
      <div class="post">
        <h2 class="post-title">
        <!-- <a href="{{ post.url }}"> -->
          {{ post.title }}
        <!-- </a> -->
        </h2>
        <span class="now-date">{{ post.date | date_to_string }}</span>
        <span class="now-content">{{ post.content }}</span>
      </div>
    {% endif%}
  {% endfor %}
</div>