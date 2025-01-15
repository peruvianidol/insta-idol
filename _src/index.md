---
layout: base.njk
pagination:
  data: posts
  size: 12
  alias: posts
permalink: "{% if pagination.pageNumber>0 %}/{{ pagination.pageNumber + 1 }}{% endif %}/index.html"
eleventyComputed:
  title: "Insta-Idol {% if pagination.pageNumber>0 %} | Page {{ pagination.pageNumber + 1 }}{% endif %}"
---

<div class="grid">
  {%- for post in posts | limit(12) -%}
    <figure>
        {%- for url in post.media | limit(1) -%}
          <button class="dialog-button" data-dialog-id="{{ post.creation_timestamp }}">
            {%- if url.slice(-3) === "mp4" -%}
              <div class="video-icon">
                <svg>
                  <use xlink:href="#video"></use>
                </svg>
              </div>
              <video src="{{ url }}">
            {%- else -%}
              <img src="{{ url | optimize('/c_scale,w_800/q_auto/f_auto') }}" alt="">
            {%- endif -%}
          </button>
        {%- endfor -%}
        {%- if post.media.length > 1 -%}
          <div class="icon-multiple">
            <svg>
              <use xlink:href="#multiple"></use>
            </svg>
          </div>
        {%- endif -%}
      <figcaption>
        <p><strong>peruviandiol</strong> {{ post.title }}</p>
        <time datetime="{{ post.creation_timestamp }}">{{ post.creation_timestamp | postDate }}</time>
      </figcaption>
    </figure>
    <dialog id="{{ post.creation_timestamp }}">
      <div>
        {%- for url in post.media -%}
          {%- if url.slice(-3) === "mp4" -%}
            <video src="{{ url | optimize('/q_auto/f_auto') }}" controls loop>
          {%- else -%}
            <img src="{{ url | optimize('/q_auto/f_auto') }}" alt="">
          {% endif %}
        {%- endfor -%}
      </div>
    </dialog>
  {%- endfor -%}
</div>
<nav class="pagination">
  <ol>
    <li>{% if pagination.href.previous %}<a href="{{ pagination.href.previous }}">Newer</a>{% endif %}</li>
    <li>{{ pagination.pageNumber + 1 }} of {{ pagination.hrefs.length }}</li>
    <li>{% if pagination.href.next %}<a href="{{ pagination.href.next }}">Older</a>{% endif %}</li>
  </ol>
</nav>
<footer>
  <p>Made with spite by <a href="https://mikeaparicio.com">Mike Aparicio</a> because fuck Zuck.</p>
</footer>