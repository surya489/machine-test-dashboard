/*******************************
     * Data sets (provided by you)
     *******************************/
    const peopleData = [
      { name:'Aishwarya R', title:'UI Designer', email:'aishwarya@example.com', phone:'9841000001', location:'Coimbatore' },
      { name:'Karthik V', title:'Frontend Developer', email:'karthik@example.com', phone:'9841000002', location:'Coimbatore' },
      { name:'Meera S', title:'UX Researcher', email:'meera@example.com', phone:'9841000003', location:'Coonoor' },
      { name:'Rohit P', title:'Product Designer', email:'rohit@example.com', phone:'9841000004', location:'Coimbatore' },
      { name:'Sneha K', title:'Front-end Dev', email:'sneha@example.com', phone:'9841000005', location:'Coimbatore' },
      { name:'Vivek L', title:'QA Engineer', email:'vivek@example.com', phone:'9841000006', location:'Coimbatore' },
      { name:'Priya M', title:'UX Designer', email:'priya@example.com', phone:'9841000007', location:'Coimbatore' },
      { name:'Ajay N', title:'Data Analyst', email:'ajay@example.com', phone:'9841000008', location:'Coonoor' },
      { name:'Deepa T', title:'UI/UX', email:'deepa@example.com', phone:'9841000009', location:'Coimbatore' },
      { name:'Santhosh R', title:'Frontend', email:'santhosh@example.com', phone:'9841000010', location:'Coimbatore' },
      { name:'Anita P', title:'Design Lead', email:'anita@example.com', phone:'9841000011', location:'Coimbatore' },
      { name:'Kiran D', title:'Intern', email:'kiran@example.com', phone:'9841000012', location:'Coimbatore' },
      { name:'Manju R', title:'UX Writer', email:'manju@example.com', phone:'9841000013', location:'Coonoor' },
      { name:'Girish S', title:'Frontend', email:'girish@example.com', phone:'9841000014', location:'Coimbatore' }
    ];

    const defaultCompanies = [
      { company: 'Company One', total: 5, added: 5, removed: 2 },
      { company: 'Company Two', total: 5, added: 3, removed: 1 },
      { company: 'Company Three', total: 3, added: 4, removed: 0 }
    ];
    let companies = JSON.parse(localStorage.getItem('companiesData')) || defaultCompanies.slice();
    function saveCompanies(){ localStorage.setItem('companiesData', JSON.stringify(companies)); }

    const defaultNews = [
      { title: 'UI Design Trends 2025', date: '2025-10-25', count: 3 },
      { title: 'Next.js 15 Launch', date: '2025-10-20', count: 5 }
    ];
    const defaultCareers = [
      { title: 'Frontend Developer', openings: 3 },
      { title: 'UI/UX Designer', openings: 2 }
    ];

    /* ---------- helpers ---------- */
    function escapeHtml(s){ return (s+'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])); }

    /* ---------- companies table (dashboard) ---------- */
    function renderCompaniesTable(){
      const $t = $('#peopleMainTable tbody').empty();
      if(companies.length === 0){ $('#noPeopleMsg').show(); } else { $('#noPeopleMsg').hide(); companies.forEach((c,i)=> {
        $t.append(`<tr data-index="${i}">
          <td>${escapeHtml(c.company)}</td>
          <td>${c.total}</td>
          <td>${c.added}</td>
          <td>${c.removed}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary editCompanyBtn" data-idx="${i}" title="Edit"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger deleteCompanyBtn" data-idx="${i}" title="Delete"><i class="bi bi-trash"></i></button>
          </td>
        </tr>`); }); }
      // update metrics
      $('#metricPeople').text(companies.reduce((sum, c) => sum + (Number(c.total) || 0), 0));
      $('#metricNews').text(defaultNews.length);
      $('#metricCases').text(defaultCareers.reduce((s,c)=>s+c.openings,0));
      $('#metricCareers').text(0);
    }

    /* ---------- company edit & add handlers (modal) ---------- */
    const editCompanyModal = new bootstrap.Modal(document.getElementById('editCompanyModal'), { backdrop:'static' });

    // Open modal for edit
    $(document).on('click', '.editCompanyBtn', function(){
      const idx = +$(this).data('idx');
      const c = companies[idx];
      $('#editCompanyIndex').val(idx);
      $('#editCompanyName').val(c.company);
      $('#editCompanyTotal').val(c.total);
      $('#editCompanyAdded').val(c.added);
      $('#editCompanyRemoved').val(c.removed);
      $('#deleteCompanyBtn').show();
      editCompanyModal.show();
    });

    // Add company
    $('#addCompanyBtn').on('click', function(){
      $('#editCompanyIndex').val(companies.length);
      $('#editCompanyName').val('');
      $('#editCompanyTotal').val('');
      $('#editCompanyAdded').val('');
      $('#editCompanyRemoved').val('');
      $('#deleteCompanyBtn').hide();
      editCompanyModal.show();
    });

    // Delete via button in table (quick)
    $(document).on('click', '.deleteCompanyBtn', function(){
      const idx = +$(this).data('idx');
      if(confirm('Delete this company?')){ companies.splice(idx,1); saveCompanies(); renderCompaniesTable(); renderCompaniesChart(); }
    });

    // Save from modal (both create & update)
    $('#saveCompanyBtn').on('click', function(){
      const idx = Number($('#editCompanyIndex').val());
      const name = $('#editCompanyName').val().trim();
      const total = Number($('#editCompanyTotal').val()) || 0;
      const added = Number($('#editCompanyAdded').val()) || 0;
      const removed = Number($('#editCompanyRemoved').val()) || 0;
      if(!name){ alert('Company name required'); return; }
      if(idx >= 0 && idx < companies.length){
        companies[idx] = { company:name, total, added, removed };
      } else {
        companies.push({ company:name, total, added, removed });
      }
      saveCompanies();
      editCompanyModal.hide();
      renderCompaniesTable();
      renderCompaniesChart();
    });

    // Delete from modal
    $('#deleteCompanyBtn').on('click', function(){
      const idx = Number($('#editCompanyIndex').val());
      if(confirm('Delete this company?')){ companies.splice(idx,1); saveCompanies(); editCompanyModal.hide(); renderCompaniesTable(); renderCompaniesChart(); }
    });

    /* ---------- companies chart (dashboard) ---------- */
    let companiesChart = null;
    function renderCompaniesChart(){
      const ctx = document.getElementById('peopleChart');
      if(!ctx) return;
      if(companiesChart) companiesChart.destroy();
      companiesChart = new Chart(ctx, {
        type:'bar',
        data:{
          labels: companies.map(c=>c.company),
          datasets: [
            { label:'Total', data: companies.map(c=>c.total), backgroundColor:'#3b82f6' },
            { label:'Added', data: companies.map(c=>c.added), backgroundColor:'#10b981' },
            { label:'Removed', data: companies.map(c=>c.removed), backgroundColor:'#ef4444' }
          ]
        },
        options:{ responsive:true, scales:{ y:{ beginAtZero:true } } }
      });
    }
    $('#showPeopleChart').on('click', function(){ $('#peopleTableContainer').addClass('d-none'); $('#peopleChartContainer').removeClass('d-none'); renderCompaniesChart(); });
    $('#showPeopleTable').on('click', function(){ $('#peopleChartContainer').addClass('d-none'); $('#peopleTableContainer').removeClass('d-none'); });

    /* ---------- render news & careers ---------- */
    function renderNewsCareers(){
      $('#newsTable tbody').empty();
      defaultNews.forEach(n => $('#newsTable tbody').append(`<tr><td>${escapeHtml(n.title)}</td><td>${n.date}</td><td>${n.count}</td></tr>`));
      $('#careersTable tbody').empty();
      defaultCareers.forEach(c => $('#careersTable tbody').append(`<tr><td>${escapeHtml(c.title)}</td><td>${c.openings}</td></tr>`));
    }
    $('#showNewsChart').on('click', function(){
      $('#newsChartContainer').toggleClass('d-none');
      const ctx = document.getElementById('newsChart');
      if(!ctx) return;
      new Chart(ctx, { type:'bar', data:{ labels: defaultNews.map(n=>n.title), datasets:[{ label:'Count', data: defaultNews.map(n=>n.count), backgroundColor:'#f97316' }] }, options:{ responsive:true, scales:{ y:{ beginAtZero:true } } } });
    });
    $('#showCareersChart').on('click', function(){
      $('#careersChartContainer').toggleClass('d-none');
      const ctx = document.getElementById('careersChart');
      if(!ctx) return;
      new Chart(ctx, { type:'bar', data:{ labels: defaultCareers.map(c=>c.title), datasets:[{ label:'Openings', data: defaultCareers.map(c=>c.openings), backgroundColor:'#10b981' }] }, options:{ responsive:true, scales:{ y:{ beginAtZero:true } } } });
    });

    /* ---------- People Screen: search, sort, numbered pagination ---------- */
    let peopleState = { filter:'', sortKey:null, sortDir:1, page:1, perPage: Number($('#rowsPerPage').val() || 10) };

    function getFilteredSortedPeople(){
      const f = (peopleState.filter||'').toLowerCase();
      let data = peopleData.filter(p => Object.values(p).join(' ').toLowerCase().includes(f));
      if(peopleState.sortKey){
        data.sort((a,b)=>{
          const A = (''+a[peopleState.sortKey]).toLowerCase();
          const B = (''+b[peopleState.sortKey]).toLowerCase();
          if(A===B) return 0;
          return (A > B ? 1 : -1) * peopleState.sortDir;
        });
      }
      return data;
    }

    function renderPeopleScreen(){
      const filtered = getFilteredSortedPeople();
      const per = peopleState.perPage;
      const total = filtered.length;
      const pages = Math.max(1, Math.ceil(total/per));
      if(peopleState.page > pages) peopleState.page = pages;
      const start = (peopleState.page-1)*per;
      const pageData = filtered.slice(start, start+per);

      const $tbody = $('#peopleTable tbody').empty();
      if(pageData.length === 0){ $tbody.append(`<tr><td colspan="5" class="text-center small-muted">No records</td></tr>`); }
      else { pageData.forEach((r,idx)=> {
        $tbody.append(`<tr>
          <td>${escapeHtml(r.name)}</td>
          <td>${escapeHtml(r.title)}</td>
          <td>${escapeHtml(r.email)}</td>
          <td>${escapeHtml(r.phone)}</td>
          <td>${escapeHtml(r.location)}</td>
        </tr>`); }); }

      $('#peopleCount').text(total);
      renderPaginationNumbers(total, pages, peopleState.page);
      renderLocationChart(filtered);
    }

    function renderPaginationNumbers(total,pages,current){
      const $root = $('#paginationNumbers').empty();
      const maxButtons = 7;
      let start = Math.max(1, current-3);
      let end = Math.min(pages, start + maxButtons -1);
      if(end - start < maxButtons -1) start = Math.max(1, end - maxButtons +1);

      function addPage(n){
        const $p = $(`<div class="page-num ${n===current?'active':''}" data-page="${n}">${n}</div>`);
        $root.append($p);
      }

      if(start>1){ addPage(1); if(start>2) $root.append($(`<div class="page-num">...</div>`)); }
      for(let i=start;i<=end;i++) addPage(i);
      if(end<pages){ if(end<pages-1) $root.append($(`<div class="page-num">...</div>`)); addPage(pages); }

      $root.find('.page-num').off('click').on('click', function(){ const p = parseInt($(this).data('page'),10); if(!p||p===peopleState.page) return; peopleState.page = p; renderPeopleScreen(); });

      // update hidden current/total (if you want)
      // $('#currentPage').text(current); $('#totalPages').text(pages);
    }

    // events
    $('#peopleSearch').on('input', function(){ peopleState.filter = $(this).val(); peopleState.page = 1; renderPeopleScreen(); });
    $('#rowsPerPage').on('change', function(){ peopleState.perPage = parseInt($(this).val(),10); peopleState.page = 1; renderPeopleScreen(); });
    $('#prevPage').on('click', function(){ if(peopleState.page>1){ peopleState.page--; renderPeopleScreen(); } });
    $('#nextPage').on('click', function(){ const total = getFilteredSortedPeople().length; const pages = Math.max(1, Math.ceil(total/peopleState.perPage)); if(peopleState.page < pages){ peopleState.page++; renderPeopleScreen(); } });
    $('#peopleTable thead').on('click','th.sortable', function(){ const key = $(this).data('key'); if(peopleState.sortKey === key) peopleState.sortDir *= -1; else { peopleState.sortKey = key; peopleState.sortDir = 1; } $('#peopleTable thead th .sort-indicator').text(''); $(this).find('.sort-indicator').text(peopleState.sortDir===1 ? ' ▲' : ' ▼'); renderPeopleScreen(); });

    /* ---------- People location chart ---------- */
    let locationChart = null;
    function renderLocationChart(filteredData){
      const target = filteredData || getFilteredSortedPeople();
      const counts = {};
      target.forEach(p => counts[p.location] = (counts[p.location]||0) + 1);
      const labels = Object.keys(counts);
      const values = labels.map(l => counts[l]);
      const ctx = document.getElementById('peopleLocationChart');
      if(!ctx) return;
      if(locationChart) locationChart.destroy();
      locationChart = new Chart(ctx, { type:'pie', data:{ labels, datasets:[{ data: values, backgroundColor: labels.map((_,i)=> ['#3b82f6','#10b981','#f97316','#8b5cf6','#ef4444'][i%5]) }] }, options:{ responsive:true } });
    }

    /* ---------- Overview small chart (bar: People total, News, Careers) ---------- */
    let overviewChart = null;
    function showOverviewChartIfNeeded(){
      const existing = document.getElementById('overviewSmallChart');
      if(!existing){
        $('#screen-dashboard').prepend(`<div class="data-card mb-3"><div class="table-title"><div><h6 class="mb-0">Overview Chart</h6><div class="small-muted">People total (all), News and Careers</div></div></div><div class="pt-3"><canvas id="overviewSmallChart" height="90"></canvas></div></div>`);
      }
      const ctx = document.getElementById('overviewSmallChart');
      if(!ctx) return;
      if(overviewChart) overviewChart.destroy();
      const peopleTotal = peopleData.length;
      const newsTotal = defaultNews.length;
      const careersTotal = defaultCareers.reduce((s,c)=>s+c.openings,0);
      overviewChart = new Chart(ctx.getContext('2d'), {
        type:'bar',
        data:{ labels:['People','News','Careers'], datasets:[{ label:'Counts', data:[peopleTotal, newsTotal, careersTotal], backgroundColor:['#3b82f6','#ef4444','#10b981'] }] },
        options:{ responsive:true, plugins:{ legend:{display:false} }, scales:{ y:{ beginAtZero:true } } }
      });
    }

    /* ---------- UI & routing ---------- */
    function showScreen(name){
      $('.menu-link').removeClass('active');
      $(`.menu-link[data-target="${name}"]`).addClass('active');
      $('section[id^="screen-"]').addClass('d-none');
      $(`#screen-${name}`).removeClass('d-none');
      if(name === 'dashboard'){
        renderCompaniesTable();
        renderCompaniesChart();
      } else if(name === 'people'){
        renderPeopleScreen();
      }
    }

    $(function(){
      // initial render
      renderCompaniesTable();
      renderNewsCareers();
      renderPeopleScreen();
      renderCompaniesChart();

      // menu clicks
      $('.menu-link').on('click', function(e){ e.preventDefault(); showScreen($(this).data('target')); });

      // top toggles
      $('#btnChartView').on('click', function(){ showOverviewChartIfNeeded(); $('html,body').animate({ scrollTop: 0 }, 200); });
      $('#btnTableView').on('click', function(){ const el = document.getElementById('overviewSmallChart'); if(el) el.parentElement.parentElement.remove(); });

      // sidebar collapse (desktop)
      $('#toggleSidebar').on('click', function(){
        $('#sidebar').toggleClass('collapsed');
        // rotate icon
        $(this).find('i').toggleClass('bi-chevron-left bi-chevron-right');
      });
      // mobile toggle
      $('#toggleSidebarMobile').on('click', function(){ $('#sidebar').toggle(); });

      // global search
      $('#globalSearch').on('input', function(){ const q = $(this).val().trim(); if(q.length){ showScreen('people'); $('#peopleSearch').val(q).trigger('input'); } });

      // Add keyboard accessibility: Enter in company modal to save
      $('#editCompanyForm').on('submit', function(e){ e.preventDefault(); $('#saveCompanyBtn').trigger('click'); });
    });

    // stored companies
    window._resetCompanies = function(){ companies = defaultCompanies.slice(); saveCompanies(); renderCompaniesTable(); renderCompaniesChart(); };
