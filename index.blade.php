
@if(!empty($preconnects))
    @foreach($preconnects as $preconnect)
        @if(is_string($preconnect))
            <link rel="preconnect" href="{!! $preconnect !!}" />
        @else
            <link rel="preconnect" href="{!! $preconnect['url'] !!}" @if(!empty($preconnect['crossorigin'])) crossorigin="{{$preconnect['crossorigin']}}" @endif />
        @endif
    @endforeach
@endif

@if(!empty($preset_shipping))
    <meta name="preset_shipping" content="{{json_encode($preset_shipping ?? null)}}" />
@endif

@if(!empty($preloads))
    @foreach($preloads as $preload)
        @if(!empty($preload))
            @if(is_string($preload))
                <link rel="preload" href="{!! $preload !!}" as="fetch" />
            @else
                <link rel="preload" href="{!! $preload['url'] !!}" as="fetch" @if(!empty($preload['crossorigin'])) crossorigin="{{$preload['crossorigin']}}" @endif />
            @endif
        @endif
    @endforeach
@endif

@if(!empty($scripts))
    @foreach($scripts as $script)
        @if(!empty($script))
            @if(is_string($script))
                <script type="text/javascript" src="{!! $script!!}" ></script>
            @else
                <script type="text/javascript" src="{!! $script['href'] !!}" @if(!empty($script['crossorigin'])) crossorigin="{{$script['crossorigin']}}" @endif></script>
            @endif
        @endif
    @endforeach
@endif
