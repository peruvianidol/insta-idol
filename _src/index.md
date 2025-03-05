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
                <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" clip-rule="evenodd" viewBox="0 0 24 24"><path d="M23 7.061v9.878c0 .689-.56 1.249-1.248 1.249H2.248A1.25 1.25 0 0 1 1 16.938V7.062c0-.689.56-1.249 1.248-1.249h19.504c.689 0 1.248.56 1.248 1.25Zm-6.823 4.78-7.38-4.03a.2.2 0 0 0-.198.003.199.199 0 0 0-.1.172v8.029a.2.2 0 0 0 .295.176l7.383-3.998a.2.2 0 0 0 0-.351Z"/></svg>
              </div>
              <video src="{{ url }}">
            {%- else -%}
              <img src="{{ url | optimize('/q_auto/f_auto') }}" alt="" eleventy:widths="600, 1440" sizes="(max-width: 600px) 600px, 1440px">
            {%- endif -%}
          </button>
        {%- endfor -%}
        {%- if post.media.length > 1 -%}
          <div class="icon-multiple">
            <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" clip-rule="evenodd" viewBox="0 0 24 24"><path d="M19.857 1.93v16.997a.93.93 0 0 1-.93.93H1.93a.93.93 0 0 1-.93-.93V1.93A.93.93 0 0 1 1.93 1h16.997a.93.93 0 0 1 .93.93Zm1.048 2.212h1.165a.93.93 0 0 1 .93.931V22.07a.93.93 0 0 1-.93.93H5.073a.93.93 0 0 1-.93-.93v-1.166h15.832a.93.93 0 0 0 .93-.93V4.143Z"/></svg>
          </div>
        {%- endif -%}
      <figcaption>
        <p><strong>peruviandiol</strong> {{ post.title }}</p>
        <time datetime="{{ post.creation_timestamp }}">{{ post.creation_timestamp | postDate }}</time>
      </figcaption>
    </figure>
    <dialog id="{{ post.creation_timestamp }}">
      <figure>
        <button class="prev" aria-label="Previous Image"></button>
        <div class="image-container">
          {%- for url in post.media -%}
            {%- if url.slice(-3) === "mp4" -%}
              <video src="{{ url | optimize('/q_auto/f_auto') }}" controls loop>
            {%- else -%}
              <img src="{{ url | optimize('/q_auto/f_auto') }}" alt="" eleventy:widths="600, 1440" sizes="(max-width: 600px) 600px, 1440px">
            {% endif %}
          {%- endfor -%}
        </div>
        <button class="next" aria-label="Next Image"></button>
        <figcaption>
          <p><strong>peruviandiol</strong> {{ post.title }}</p>
          <time datetime="{{ post.creation_timestamp }}">{{ post.creation_timestamp | postDate }}</time>
        </figcaption>
      </figure>
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