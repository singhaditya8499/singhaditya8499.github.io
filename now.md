---
layout: default
title: Now
---

<div class="posts">
  {% for post in site.nowPosts %}
  <!-- {% if post.layout == "now" %} -->
    <div class="post">
      <h2 class="post-title">
      <a href="{{ post.url }}">
        {{ post.title }}
      </a>
      </h2>
      <span class="post-date">{{ post.date | date_to_string }}</span>
      <span class="summary">{{ post.excerpt }}</span>
    </div>
  <!-- {% endif%} -->
  {% endfor %}
</div>