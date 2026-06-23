jQuery(document).ready(function ($) {

    $('#top_bar .close_btn .elementor-icon').on('click touchstart', function (e) {
        e.preventDefault(); 
        $('header #top_bar').hide();
    });

    // main sec07
    $('#banner_slide .jet-carousel__item-inner > a').attr("href", "javascript:void(0)");

    // 상세페이지 뒤로
    $("#back_btn").click(function () {
        window.history.back();
    });

    $('#pro_cate_color > div').each(function () {
        var text = $(this).text().trim(); // 요소의 텍스트 가져오기
        if (text.includes('DX-M')) {
            $(this).css({ 'color': '#005EEB', 'border-color': '#005EEB' });
        } else if (text.includes('DX-V')) {
            $(this).css({ 'color': '#6A00EB', 'border-color': '#6A00EB' });
        } else if (text.includes('DX-H')) {
            $(this).css({ 'color': '#009632', 'border-color': '#009632' });
        }
    });

    $('.wpcf7-form').on('wpcf7mailsent', function () {
        $('#success_btn').trigger('click');
    });

    if ($('body').hasClass('page-id-1828') || $('body').hasClass('page-id-1834')) {
        $('.menu-item-5540 a').addClass('elementor-item-active');
    }
    if ($('body').hasClass('page-id-1933') || $('body').hasClass('page-id-5531') || $('body').hasClass('page-id-1920') || $('body').hasClass('page-id-1887')) {
        $('.menu-item-5541 a').addClass('elementor-item-active');
    }

    // 박스 클릭 → 파일 input 클릭
    // $('#fileUploadBox').on('click', function (e) {
    //     e.preventDefault();
    //     $('#realFile').get(0).click();
    // });

    // 파일 선택 시 텍스트 교체
    // $('#realFile').on('change', function () {
    //     let files = this.files;
    //     if (files && files.length > 0) {
    //         let fileNames = $.map(files, function (file) {
    //             return file.name;
    //         }).join(', ');

    //         // file-upload-text 안의 <p> 내용 교체
    //         $('#fileUploadBox .file-upload-text p').text(fileNames);
    //     }
    // });

    $(document).on('wpcf7mailsent', function (event) {
        var targetForms = [5536, 5527, 1926, 1919, 1886]; // 실제 폼 ID 숫자들
        if ($.inArray(event.detail.contactFormId, targetForms) !== -1) {
            $('.wpcf7-response-output').hide(); // 메시지 안 보이게
            location.replace("/contact-us/submit/"); // 바로 리다이렉트
        }
    });

    jQuery(window).on('load', function () {
        // 현재 경로
        var path = window.location.pathname;
        // 적용할 페이지 목록
        var targets = ['/contact-us/technical-support/', '/contact-us/partnership-contact/', '/contact-us/general-inquiry/'];

        // 현재 경로가 위 목록에 포함되면 실행
        if (targets.includes(path)) {
            var $target = jQuery('#inquiryBox');
            if ($target.length) {
                jQuery('html, body').animate({
                    scrollTop: $target.offset().top - 130 // 헤더 높이 보정
                }, 600);
            }
        }
    });
});


/// links
jQuery(function($){

    function splitTitles() {
        $('.jet-carousel__item-title').each(function(){
            const original = $(this).text();
            if (!original.includes('|')) return;

            const parts = original.split('|');
            const name = $.trim(parts[0]);
            const role = $.trim(parts[1]);

            // 기존 텍스트 비우고 다시 넣기
            $(this).html(
                '<span class="os-name">' + name + '</span>' +
                '<span class="os-role">' + role + '</span>'
            );
        });
    }

    // 즉시 실행
    splitTitles();

    // slick/jet-carousel 리렌더링 대비 → 딜레이 후 다시 실행
    setTimeout(splitTitles, 800);
    setTimeout(splitTitles, 1500);
});


//