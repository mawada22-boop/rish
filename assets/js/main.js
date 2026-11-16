/* =========================================================
   ريش — Rish
   Interactions & enhancements
   ========================================================= */
(function () {
  "use strict";

  var doc = document;
  var html = doc.documentElement;

  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var arNum = function (n) { return Number(n).toLocaleString("ar-EG"); };

  /* ---------- Sticky header ---------- */
  var header = $(".site-header");
  var progress = $(".progress-bar");
  var toTop = $(".to-top");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (toTop) toTop.classList.toggle("is-visible", y > 620);

    if (progress) {
      var max = doc.body.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(100, (y / max) * 100) : 0;
      progress.style.width = pct + "%";
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = $(".nav-toggle");
  var nav = $(".nav");
  var navLinks = $$(".nav a");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    doc.body.style.overflow = "";
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      doc.body.style.overflow = open ? "hidden" : "";
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) closeNav();
    });
  }

  /* ---------- Active navigation ---------- */
  var current = window.location.pathname.split("/").pop() || "index.html";
  navLinks.forEach(function (link) {
    var href = (link.getAttribute("href") || "").split("#")[0];
    if (href === current) link.classList.add("is-active");
  });

  /* ---------- Reveal on scroll ---------- */
  var revealItems = $$("[data-reveal]");
  if ("IntersectionObserver" in window && revealItems.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Year ---------- */
  $$("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Tips rotator ---------- */
  var tipsBox = $("[data-tips]");
  if (tipsBox) {
    var tips = [
      {
        cat: "العناية اليومية",
        text: "الماء النقي ليس تفصيلًا صغيرًا؛ غيّره مرتين يوميًا، واغسل الوعاء قبل أن تملأه."
      },
      {
        cat: "النوم والضوء",
        text: "الضوء الاصطناعي في الليل يربك ساعة طائرك البيولوجية. غطِّ القفص، واحترم ساعات الظلام."
      },
      {
        cat: "التغذية",
        text: "التنويع الغذائي لا يحدث بين يوم وليلة. ابدأ بملعقة خضار صغيرة، وكرّرها بهدوء كل صباح."
      },
      {
        cat: "مساحة القفص",
        text: "القفص الأوسع ليس رفاهية؛ إنه مساحة للطيران، والطيران صحة للجسم والعقل."
      }
    ];

    var tipText = $("[data-tip-text]", tipsBox);
    var tipCat = $("[data-tip-cat]", tipsBox);
    var tipCount = $("[data-tip-count]", tipsBox);
    var tipDots = $("[data-tip-dots]", tipsBox);
    var tipPrev = $("[data-tip-prev]", tipsBox);
    var tipNext = $("[data-tip-next]", tipsBox);
    var tipIndex = 0;
    var tipTimer;

    tips.forEach(function (_, i) {
      var dot = doc.createElement("button");
      dot.type = "button";
      dot.className = "tip-card__dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", "النصيحة " + arNum(i + 1));
      dot.addEventListener("click", function () { showTip(i); restartTips(); });
      if (tipDots) tipDots.appendChild(dot);
    });

    var dots = tipDots ? $$(".tip-card__dot", tipDots) : [];

    function showTip(i) {
      tipIndex = (i + tips.length) % tips.length;
      if (tipText) {
        tipText.style.opacity = "0";
        window.setTimeout(function () {
          tipText.textContent = tips[tipIndex].text;
          tipText.style.opacity = "1";
        }, 160);
      }
      if (tipCat) tipCat.textContent = tips[tipIndex].cat;
      if (tipCount) tipCount.textContent = "0" + (tipIndex + 1) + " / 0" + tips.length;
      dots.forEach(function (d, di) { d.classList.toggle("is-active", di === tipIndex); });
    }

    function restartTips() {
      window.clearInterval(tipTimer);
      tipTimer = window.setInterval(function () { showTip(tipIndex + 1); }, 9000);
    }

    if (tipNext) tipNext.addEventListener("click", function () { showTip(tipIndex + 1); restartTips(); });
    if (tipPrev) tipPrev.addEventListener("click", function () { showTip(tipIndex - 1); restartTips(); });

    tipsBox.addEventListener("mouseenter", function () { window.clearInterval(tipTimer); });
    tipsBox.addEventListener("mouseleave", restartTips);
    restartTips();
  }

  /* ---------- Species quiz ---------- */
  var quiz = $("[data-quiz]");
  if (quiz) {
    var questions = [
      {
        q: "كم وقتًا تستطيع تخصيصه للتفاعل اليومي؟",
        options: [
          { label: "أقل من ساعة", scores: { canary: 3, rosella: 1, cockatiel: 1 } },
          { label: "ساعة إلى ساعتين", scores: { lovebird: 2, cockatiel: 2, rosella: 1 } },
          { label: "أكثر من ساعتين", scores: { parrot: 3, cockatiel: 1, lovebird: 1 } }
        ]
      },
      {
        q: "ما مستوى الصوت الذي يريحك في المنزل؟",
        options: [
          { label: "هادئ", scores: { canary: 2, cockatiel: 2, rosella: 1 } },
          { label: "متوسط", scores: { lovebird: 2, rosella: 2, cockatiel: 1 } },
          { label: "لا يزعجني الصوت العالي", scores: { parrot: 3, lovebird: 1 } }
        ]
      },
      {
        q: "ماذا تبحث عنه أكثر؟",
        options: [
          { label: "رفيق تفاعلي", scores: { parrot: 2, cockatiel: 2, lovebird: 1 } },
          { label: "تغريد ومراقبة", scores: { canary: 3, cockatiel: 2 } },
          { label: "ألوان وحركة", scores: { rosella: 3, lovebird: 1, parrot: 1 } }
        ]
      }
    ];

    var results = {
      parrot: {
        name: "الببغاوات",
        img: "assets/img/parrot.jpg",
        text: "تبدو جاهزًا لرفيق ذكي يحتاج تفاعلًا حقيقيًا. الببغاء يمنحك علاقة قوية، لكنه يطلب وقتًا وألعابًا وصبرًا يوميًا.",
        href: "types.html#parrots"
      },
      lovebird: {
        name: "طيور الحب",
        img: "assets/img/lovebird.jpg",
        text: "طائر صغير بنشاط كبير. مناسب إن كنت تريد رفقة اجتماعية بحجم صغير، مع وقت يومي وصوت نشط.",
        href: "types.html#lovebirds"
      },
      cockatiel: {
        name: "الكوكتيل",
        img: "assets/img/cockatiel.jpg",
        text: "توازن جميل بين الرفقة والهدوء. الكوكتيل اجتماعي ويصفّر، ويحتاج روتينًا ثابتًا ونومًا كافيًا.",
        href: "types.html#cockatiel"
      },
      rosella: {
        name: "الروز (الروزيلا)",
        img: "assets/img/rosella.jpg",
        text: "عينك تبحث عن الجمال والحركة. الروز طائر مستقل نسبيًا يحتاج مساحة أوسع مما تتوقع، وقفصًا عريضًا.",
        href: "types.html#rosella"
      },
      canary: {
        name: "الكناري",
        img: "assets/img/canary.jpg",
        text: "بيئة هادئة وتغريد صباحي هما ما يناسبك. الكناري مستقل، ويحتاج مساحة طيران أفقية ومكانًا بعيدًا عن الروائح.",
        href: "types.html#canary"
      }
    };

    var stepIndex = 0;
    var scores = {};
    var qBox = $("[data-quiz-question]", quiz);
    var resultBox = $("[data-quiz-result]", quiz);
    var progressText = $("[data-quiz-progress]", quiz);
    var progressBar = $("[data-quiz-bar]", quiz);
    var restartBtn = $("[data-quiz-restart]", quiz);
    var resultImg = $("[data-quiz-img]", quiz);
    var resultName = $("[data-quiz-name]", quiz);
    var resultText = $("[data-quiz-text]", quiz);
    var resultLink = $("[data-quiz-link]", quiz);
    var resultActions = $("[data-quiz-restart]", quiz);

    function renderQuestion() {
      var item = questions[stepIndex];
      if (!qBox) return;
      qBox.innerHTML = "";

      var q = doc.createElement("p");
      q.className = "quiz__question";
      q.textContent = item.q;
      qBox.appendChild(q);

      var opts = doc.createElement("div");
      opts.className = "quiz__options";

      item.options.forEach(function (opt) {
        var b = doc.createElement("button");
        b.type = "button";
        b.className = "quiz__option";
        b.textContent = opt.label;
        b.addEventListener("click", function () {
          Object.keys(opt.scores).forEach(function (key) {
            scores[key] = (scores[key] || 0) + opt.scores[key];
          });
          stepIndex++;
          if (stepIndex < questions.length) {
            renderQuestion();
          } else {
            showResult();
          }
        });
        opts.appendChild(b);
      });

      qBox.appendChild(opts);

      if (progressText) {
        progressText.textContent = "السؤال " + arNum(stepIndex + 1) + " من " + arNum(questions.length);
      }
      if (progressBar) {
        progressBar.style.width = (((stepIndex + 1) / questions.length) * 100) + "%";
      }
    }

    function showResult() {
      var winner = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; })[0];
      var data = results[winner] || results.cockatiel;

      if (qBox) qBox.style.display = "none";
      if (resultBox) resultBox.classList.add("is-visible");
      if (resultImg) {
        resultImg.src = data.img;
        resultImg.alt = data.name;
      }
      if (resultName) resultName.textContent = data.name;
      if (resultText) resultText.textContent = data.text;
      if (resultLink) {
        resultLink.href = data.href;
        resultLink.textContent = "اقرأ عن " + data.name;
      }
      if (progressBar) progressBar.style.width = "100%";
      if (progressText) progressText.textContent = "اكتمل الترشيح";
      if (resultBox) resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function resetQuiz() {
      scores = {};
      stepIndex = 0;
      if (qBox) qBox.style.display = "";
      if (resultBox) resultBox.classList.remove("is-visible");
      if (progressBar) progressBar.style.width = "33%";
      renderQuestion();
    }

    if (restartBtn) restartBtn.addEventListener("click", resetQuiz);
    if (resultActions && resultActions !== restartBtn) {
      resultActions.addEventListener("click", resetQuiz);
    }

    renderQuestion();
  }

  /* ---------- Daily checklist ---------- */
  var checklist = $("[data-checklist]");
  if (checklist) {
    var key = "rish-daily-checklist";
    var boxes = $$("input[type=checkbox]", checklist);
    var bar = $("[data-check-bar]", checklist);
    var count = $("[data-check-count]", checklist);
    var reset = $("[data-check-reset]", checklist);
    var stored = [];

    try {
      stored = JSON.parse(window.localStorage.getItem(key) || "[]");
    } catch (e) {
      stored = [];
    }

    boxes.forEach(function (box, i) {
      box.checked = stored.indexOf(i) !== -1;
      box.addEventListener("change", updateChecklist);
    });

    function updateChecklist() {
      var checked = [];
      boxes.forEach(function (box, i) {
        if (box.checked) checked.push(i);
      });
      try {
        window.localStorage.setItem(key, JSON.stringify(checked));
      } catch (e) { /* storage unavailable */ }

      var pct = boxes.length ? Math.round((checked.length / boxes.length) * 100) : 0;
      if (bar) bar.style.width = pct + "%";
      if (count) {
        count.textContent = arNum(checked.length) + " من " + arNum(boxes.length) + " مهام مكتملة";
      }
    }

    if (reset) {
      reset.addEventListener("click", function () {
        boxes.forEach(function (box) { box.checked = false; });
        try { window.localStorage.removeItem(key); } catch (e) { /* noop */ }
        updateChecklist();
      });
    }

    updateChecklist();
  }

  /* ---------- TOC scroll spy ---------- */
  var tocLinks = $$(".toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var sections = tocLinks
      .map(function (link) {
        var id = link.getAttribute("href").slice(1);
        return doc.getElementById(id);
      })
      .filter(Boolean);

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          tocLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-20% 0px -62% 0px", threshold: 0 }
    );

    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Toast ---------- */
  var toast = $(".toast");
  var toastTimer;

  function showToast(message) {
    if (!toast) return;
    var text = $("[data-toast-text]", toast);
    if (text) text.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 4200);
  }

  /* ---------- Forms (demo only) ---------- */
  $$("[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (form.hasAttribute("data-newsletter")) {
        var wrap = form.closest(".newsletter");
        if (wrap) wrap.classList.add("is-done");
        showToast("تم الاشتراك! أول رسالة تصل قريبًا.");
        form.reset();
        return;
      }

      showToast("وصلتنا رسالتك. سنرد خلال ٤٨ ساعة إن شاء الله.");
      form.reset();
    });
  });

  /* ---------- Console easter egg ---------- */
  try {
    console.log(
      "%cريش — Rish %c\nرفيقك الملوّن يستحق عناية تُشبهه.",
      "background:#4b5c3e;color:#f1d8a4;padding:6px 12px;border-radius:8px;font-weight:bold;",
      "color:#4b5c3e;"
    );
  } catch (e) { /* noop */ }
})();
