
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text$1(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text$1(' ');
    }
    function empty() {
        return text$1('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const getThumbnailSrc = (thumbnail, size) => thumbnail ?
        `${thumbnail.path}/${size}.${thumbnail.extension}` : `http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available/${size}.jpg`;

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const query = writable(null);
    const total = writable(null);
    const details = writable(null);
    const createOffset = () => {
        const { subscribe, set, update } = writable(0);
        return {
            subscribe,
            set,
            increment: () => update(n => n + 20),
            decrement: () => update(n => n - 20),
        };
    };
    const offset = createOffset();

    /* src/components/Bio.svelte generated by Svelte v3.42.4 */
    const file$f = "src/components/Bio.svelte";

    function create_fragment$f(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let h2;
    	let t1_value = /*$details*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*$details*/ ctx[0].description + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			t1 = text$1(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text$1(t3_value);
    			attr_dev(img, "class", "avatar svelte-8ru7jy");
    			if (!src_url_equal(img.src, img_src_value = getThumbnailSrc(/*$details*/ ctx[0].thumbnail, "standard_xlarge"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*$details*/ ctx[0].name);
    			add_location(img, file$f, 5, 2, 154);
    			attr_dev(h2, "class", "title svelte-8ru7jy");
    			add_location(h2, file$f, 10, 2, 274);
    			attr_dev(p, "class", "description svelte-8ru7jy");
    			add_location(p, file$f, 11, 2, 315);
    			attr_dev(div, "class", "bio svelte-8ru7jy");
    			add_location(div, file$f, 4, 0, 134);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, h2);
    			append_dev(h2, t1);
    			append_dev(div, t2);
    			append_dev(div, p);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$details*/ 1 && !src_url_equal(img.src, img_src_value = getThumbnailSrc(/*$details*/ ctx[0].thumbnail, "standard_xlarge"))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$details*/ 1 && img_alt_value !== (img_alt_value = /*$details*/ ctx[0].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*$details*/ 1 && t1_value !== (t1_value = /*$details*/ ctx[0].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$details*/ 1 && t3_value !== (t3_value = /*$details*/ ctx[0].description + "")) set_data_dev(t3, t3_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let $details;
    	validate_store(details, 'details');
    	component_subscribe($$self, details, $$value => $$invalidate(0, $details = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bio', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Bio> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ getThumbnailSrc, details, $details });
    	return [$details];
    }

    class Bio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bio",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/components/CloseButton.svelte generated by Svelte v3.42.4 */
    const file$e = "src/components/CloseButton.svelte";

    function create_fragment$e(ctx) {
    	let button;
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text$1("Fermer");
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(`close ${/*className*/ ctx[0]}`) + " svelte-jc85es"));
    			add_location(button, file$e, 7, 0, 211);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onClose*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*className*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty(`close ${/*className*/ ctx[0]}`) + " svelte-jc85es"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CloseButton', slots, []);
    	let { class: className = "" } = $$props;
    	const dispatch = createEventDispatcher();
    	const onClose = () => dispatch("click");
    	const writable_props = ['class'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CloseButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, className = $$props.class);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		className,
    		dispatch,
    		onClose
    	});

    	$$self.$inject_state = $$props => {
    		if ('className' in $$props) $$invalidate(0, className = $$props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [className, onClose];
    }

    class CloseButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { class: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CloseButton",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get class() {
    		throw new Error("<CloseButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<CloseButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/BookList.svelte generated by Svelte v3.42.4 */
    const file$d = "src/components/BookList.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (18:0) {:else}
    function create_else_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Cette collection est vide.";
    			attr_dev(p, "class", "message svelte-22vrl0");
    			add_location(p, file$d, 18, 2, 382);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(18:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (6:0) {#if collection.length}
    function create_if_block$4(ctx) {
    	let ul;
    	let each_value = /*collection*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "list svelte-22vrl0");
    			add_location(ul, file$d, 6, 2, 141);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*collection, getThumbnailSrc*/ 1) {
    				each_value = /*collection*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(6:0) {#if collection.length}",
    		ctx
    	});

    	return block;
    }

    // (8:4) {#each collection as item}
    function create_each_block$2(ctx) {
    	let li;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let t1_value = /*item*/ ctx[1].title + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			li = element("li");
    			img = element("img");
    			t0 = space();
    			t1 = text$1(t1_value);
    			t2 = space();
    			if (!src_url_equal(img.src, img_src_value = getThumbnailSrc(/*item*/ ctx[1].thumbnail, "portrait_medium"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[1].title);
    			attr_dev(img, "class", "svelte-22vrl0");
    			add_location(img, file$d, 9, 8, 209);
    			attr_dev(li, "class", "svelte-22vrl0");
    			add_location(li, file$d, 8, 6, 196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, img);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*collection*/ 1 && !src_url_equal(img.src, img_src_value = getThumbnailSrc(/*item*/ ctx[1].thumbnail, "portrait_medium"))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*collection*/ 1 && img_alt_value !== (img_alt_value = /*item*/ ctx[1].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*collection*/ 1 && t1_value !== (t1_value = /*item*/ ctx[1].title + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(8:4) {#each collection as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*collection*/ ctx[0].length) return create_if_block$4;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BookList', slots, []);
    	
    	let { collection } = $$props;
    	const writable_props = ['collection'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BookList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('collection' in $$props) $$invalidate(0, collection = $$props.collection);
    	};

    	$$self.$capture_state = () => ({ getThumbnailSrc, collection });

    	$$self.$inject_state = $$props => {
    		if ('collection' in $$props) $$invalidate(0, collection = $$props.collection);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [collection];
    }

    class BookList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { collection: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BookList",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*collection*/ ctx[0] === undefined && !('collection' in props)) {
    			console.warn("<BookList> was created without expected prop 'collection'");
    		}
    	}

    	get collection() {
    		throw new Error("<BookList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collection(value) {
    		throw new Error("<BookList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Error.svelte generated by Svelte v3.42.4 */

    const { Error: Error_1$3 } = globals;
    const file$c = "src/components/Error.svelte";

    function create_fragment$c(ctx) {
    	let div;
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t = text$1(/*message*/ ctx[0]);
    			add_location(p, file$c, 4, 2, 71);
    			attr_dev(div, "class", "error svelte-2i36em");
    			add_location(div, file$c, 3, 0, 49);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$3("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*message*/ 1) set_data_dev(t, /*message*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Error', slots, []);
    	let { message } = $$props;
    	const writable_props = ['message'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Error> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    	};

    	$$self.$capture_state = () => ({ message });

    	$$self.$inject_state = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [message];
    }

    class Error$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { message: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Error",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*message*/ ctx[0] === undefined && !('message' in props)) {
    			console.warn("<Error> was created without expected prop 'message'");
    		}
    	}

    	get message() {
    		throw new Error_1$3("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error_1$3("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* src/components/Loader.svelte generated by Svelte v3.42.4 */
    const file$b = "src/components/Loader.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Chargement";
    			attr_dev(div, "class", "loader svelte-1gy5jlq");
    			toggle_class(div, "centered", /*centered*/ ctx[0]);
    			add_location(div, file$b, 4, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*centered*/ 1) {
    				toggle_class(div, "centered", /*centered*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, scale, {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, scale, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Loader', slots, []);
    	let { centered } = $$props;
    	const writable_props = ['centered'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Loader> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('centered' in $$props) $$invalidate(0, centered = $$props.centered);
    	};

    	$$self.$capture_state = () => ({ scale, centered });

    	$$self.$inject_state = $$props => {
    		if ('centered' in $$props) $$invalidate(0, centered = $$props.centered);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [centered];
    }

    class Loader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { centered: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loader",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*centered*/ ctx[0] === undefined && !('centered' in props)) {
    			console.warn("<Loader> was created without expected prop 'centered'");
    		}
    	}

    	get centered() {
    		throw new Error("<Loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centered(value) {
    		throw new Error("<Loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const apiKey = '930e43a8496c8cc563f2d22c2b2c764d';

    const fetchCharacters = async (query, _offset) => {
        const name = query ? `&nameStartsWith=${query}` : '';
        const current = _offset ? `&offset=${_offset}` : '';
        const res = await fetch(`https://gateway.marvel.com:443/v1/public/characters?apikey=${apiKey}${name}${current}`);
        const { data } = await res.json();
        const { results } = data;
        offset.set(data.offset);
        total.set(data.total);
        const characters = results;
        return characters;
    };
    const fetchCollection = async (url) => {
        const res = await fetch(`${url}?apikey=${apiKey}`);
        const { data } = await res.json();
        const { results } = data;
        return results;
    };

    /* src/components/Collection.svelte generated by Svelte v3.42.4 */

    const { Error: Error_1$2 } = globals;
    const file$a = "src/components/Collection.svelte";

    // (14:2) {:catch}
    function create_catch_block$1(ctx) {
    	let error;
    	let current;

    	error = new Error$1({
    			props: {
    				message: "Impossible d'afficher les références de ce personnage à cause d'une erreur technique."
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(error.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(error, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(14:2) {:catch}",
    		ctx
    	});

    	return block;
    }

    // (12:2) {:then collection}
    function create_then_block$1(ctx) {
    	let booklist;
    	let current;

    	booklist = new BookList({
    			props: { collection: /*collection*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(booklist.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(booklist, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const booklist_changes = {};
    			if (dirty & /*$details, category*/ 3) booklist_changes.collection = /*collection*/ ctx[2];
    			booklist.$set(booklist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(booklist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(booklist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(booklist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(12:2) {:then collection}",
    		ctx
    	});

    	return block;
    }

    // (10:60)      <Loader centered />   {:then collection}
    function create_pending_block$1(ctx) {
    	let loader;
    	let current;

    	loader = new Loader({
    			props: { centered: true },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(loader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loader, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(10:60)      <Loader centered />   {:then collection}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 2,
    		blocks: [,,,]
    	};

    	handle_promise(promise = fetchCollection(/*$details*/ ctx[1][/*category*/ ctx[0]].collectionURI), info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			attr_dev(div, "class", "content svelte-853v9z");
    			add_location(div, file$a, 8, 0, 264);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*$details, category*/ 3 && promise !== (promise = fetchCollection(/*$details*/ ctx[1][/*category*/ ctx[0]].collectionURI)) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $details;
    	validate_store(details, 'details');
    	component_subscribe($$self, details, $$value => $$invalidate(1, $details = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Collection', slots, []);
    	let { category } = $$props;
    	const writable_props = ['category'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Collection> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('category' in $$props) $$invalidate(0, category = $$props.category);
    	};

    	$$self.$capture_state = () => ({
    		BookList,
    		Error: Error$1,
    		Loader,
    		fetchCollection,
    		details,
    		category,
    		$details
    	});

    	$$self.$inject_state = $$props => {
    		if ('category' in $$props) $$invalidate(0, category = $$props.category);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [category, $details];
    }

    class Collection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { category: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Collection",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*category*/ ctx[0] === undefined && !('category' in props)) {
    			console.warn("<Collection> was created without expected prop 'category'");
    		}
    	}

    	get category() {
    		throw new Error_1$2("<Collection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set category(value) {
    		throw new Error_1$2("<Collection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Tabs.svelte generated by Svelte v3.42.4 */
    const file$9 = "src/components/Tabs.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (15:4) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let t_value = /*item*/ ctx[8] + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text$1(t_value);
    			attr_dev(button, "class", "svelte-maq59w");
    			add_location(button, file$9, 15, 6, 585);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*onClick*/ ctx[5](/*item*/ ctx[8]))) /*onClick*/ ctx[5](/*item*/ ctx[8]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 1 && t_value !== (t_value = /*item*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(15:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:4) {#if item === current}
    function create_if_block$3(ctx) {
    	let button;
    	let t_value = /*item*/ ctx[8] + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text$1(t_value);
    			attr_dev(button, "class", "svelte-maq59w");
    			add_location(button, file$9, 13, 6, 497);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			/*button_binding*/ ctx[6](button);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*onClick*/ ctx[5](/*item*/ ctx[8]))) /*onClick*/ ctx[5](/*item*/ ctx[8]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 1 && t_value !== (t_value = /*item*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			/*button_binding*/ ctx[6](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(13:4) {#if item === current}",
    		ctx
    	});

    	return block;
    }

    // (12:2) {#each items as item}
    function create_each_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[8] === /*current*/ ctx[1]) return create_if_block$3;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(12:2) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let nav;
    	let t;
    	let div;
    	let div_style_value;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div = element("div");
    			attr_dev(div, "style", div_style_value = `width: ${/*width*/ ctx[3]}px; transform: translateX(${/*shift*/ ctx[4]}px)`);
    			attr_dev(div, "class", "svelte-maq59w");
    			add_location(div, file$9, 18, 2, 656);
    			attr_dev(nav, "class", "tabs svelte-maq59w");
    			add_location(nav, file$9, 10, 0, 421);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(nav, null);
    			}

    			append_dev(nav, t);
    			append_dev(nav, div);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selected, onClick, items, current*/ 39) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(nav, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*width, shift*/ 24 && div_style_value !== (div_style_value = `width: ${/*width*/ ctx[3]}px; transform: translateX(${/*shift*/ ctx[4]}px)`)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let shift;
    	let width;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tabs', slots, []);
    	let { items = [] } = $$props;
    	let { current = null } = $$props;
    	const dispatch = createEventDispatcher();
    	const onClick = item => () => dispatch("change", { item });
    	let selected = null;
    	const writable_props = ['items', 'current'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			selected = $$value;
    			$$invalidate(2, selected);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('current' in $$props) $$invalidate(1, current = $$props.current);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		items,
    		current,
    		dispatch,
    		onClick,
    		selected,
    		width,
    		shift
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('current' in $$props) $$invalidate(1, current = $$props.current);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('width' in $$props) $$invalidate(3, width = $$props.width);
    		if ('shift' in $$props) $$invalidate(4, shift = $$props.shift);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selected*/ 4) {
    			$$invalidate(4, shift = selected === null || selected === void 0
    			? void 0
    			: selected.offsetLeft);
    		}

    		if ($$self.$$.dirty & /*selected*/ 4) {
    			$$invalidate(3, width = selected === null || selected === void 0
    			? void 0
    			: selected.offsetWidth);
    		}
    	};

    	return [items, current, selected, width, shift, onClick, button_binding];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { items: 0, current: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get items() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get current() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var CategoriesEnum;
    (function (CategoriesEnum) {
        CategoriesEnum["comics"] = "comics";
        CategoriesEnum["series"] = "series";
        CategoriesEnum["stories"] = "stories";
        CategoriesEnum["events"] = "events";
    })(CategoriesEnum || (CategoriesEnum = {}));

    /* src/components/References.svelte generated by Svelte v3.42.4 */

    const { Object: Object_1 } = globals;
    const file$8 = "src/components/References.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let tabs;
    	let t;
    	let collection;
    	let current;

    	tabs = new Tabs({
    			props: {
    				items: Object.values(CategoriesEnum),
    				current: /*current*/ ctx[0]
    			},
    			$$inline: true
    		});

    	tabs.$on("change", /*onTabChange*/ ctx[1]);

    	collection = new Collection({
    			props: { category: /*current*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tabs.$$.fragment);
    			t = space();
    			create_component(collection.$$.fragment);
    			attr_dev(div, "class", "references svelte-1tb14js");
    			add_location(div, file$8, 9, 0, 272);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tabs, div, null);
    			append_dev(div, t);
    			mount_component(collection, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabs_changes = {};
    			if (dirty & /*current*/ 1) tabs_changes.current = /*current*/ ctx[0];
    			tabs.$set(tabs_changes);
    			const collection_changes = {};
    			if (dirty & /*current*/ 1) collection_changes.category = /*current*/ ctx[0];
    			collection.$set(collection_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			transition_in(collection.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			transition_out(collection.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tabs);
    			destroy_component(collection);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('References', slots, []);
    	let current = CategoriesEnum.comics;

    	const onTabChange = ({ detail }) => {
    		$$invalidate(0, current = detail.item);
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<References> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Collection,
    		Tabs,
    		CategoriesEnum,
    		current,
    		onTabChange
    	});

    	$$self.$inject_state = $$props => {
    		if ('current' in $$props) $$invalidate(0, current = $$props.current);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [current, onTabChange];
    }

    class References extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "References",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/CharacterDetails.svelte generated by Svelte v3.42.4 */
    const file$7 = "src/components/CharacterDetails.svelte";

    // (12:0) {#if isOpen}
    function create_if_block$2(ctx) {
    	let div;
    	let bio;
    	let t0;
    	let references;
    	let t1;
    	let closebutton;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;
    	bio = new Bio({ $$inline: true });
    	references = new References({ $$inline: true });

    	closebutton = new CloseButton({
    			props: { class: "close-details" },
    			$$inline: true
    		});

    	closebutton.$on("click", /*close*/ ctx[2]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(bio.$$.fragment);
    			t0 = space();
    			create_component(references.$$.fragment);
    			t1 = space();
    			create_component(closebutton.$$.fragment);
    			attr_dev(div, "class", "details svelte-1vn9edl");
    			add_location(div, file$7, 12, 2, 416);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(bio, div, null);
    			append_dev(div, t0);
    			mount_component(references, div, null);
    			append_dev(div, t1);
    			mount_component(closebutton, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "outroend", /*onCloseAnimationEnds*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bio.$$.fragment, local);
    			transition_in(references.$$.fragment, local);
    			transition_in(closebutton.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, fly, /*flyParams*/ ctx[1]);
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bio.$$.fragment, local);
    			transition_out(references.$$.fragment, local);
    			transition_out(closebutton.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, /*flyParams*/ ctx[1]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(bio);
    			destroy_component(references);
    			destroy_component(closebutton);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(12:0) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*isOpen*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let isOpen;
    	let $details;
    	validate_store(details, 'details');
    	component_subscribe($$self, details, $$value => $$invalidate(4, $details = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CharacterDetails', slots, []);
    	const flyParams = { y: 500, duration: 500 };
    	const close = () => $$invalidate(0, isOpen = false);
    	const onCloseAnimationEnds = () => details.set(null);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CharacterDetails> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Bio,
    		CloseButton,
    		References,
    		details,
    		fly,
    		flyParams,
    		close,
    		onCloseAnimationEnds,
    		isOpen,
    		$details
    	});

    	$$self.$inject_state = $$props => {
    		if ('isOpen' in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$details*/ 16) {
    			$$invalidate(0, isOpen = !!$details);
    		}
    	};

    	return [isOpen, flyParams, close, onCloseAnimationEnds, $details];
    }

    class CharacterDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CharacterDetails",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/Character.svelte generated by Svelte v3.42.4 */
    const file$6 = "src/components/Character.svelte";

    function create_fragment$6(ctx) {
    	let button;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let span;
    	let t1_value = /*character*/ ctx[0].name + "";
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			t0 = space();
    			span = element("span");
    			t1 = text$1(t1_value);
    			attr_dev(img, "class", "avatar svelte-bvlfgv");
    			if (!src_url_equal(img.src, img_src_value = getThumbnailSrc(/*character*/ ctx[0].thumbnail, "standard_medium"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*character*/ ctx[0].name);
    			add_location(img, file$6, 8, 2, 266);
    			attr_dev(span, "class", "name svelte-bvlfgv");
    			add_location(span, file$6, 13, 2, 388);
    			attr_dev(button, "class", "character svelte-bvlfgv");
    			add_location(button, file$6, 7, 0, 211);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, img);
    			append_dev(button, t0);
    			append_dev(button, span);
    			append_dev(span, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*displayDetails*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*character*/ 1 && !src_url_equal(img.src, img_src_value = getThumbnailSrc(/*character*/ ctx[0].thumbnail, "standard_medium"))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*character*/ 1 && img_alt_value !== (img_alt_value = /*character*/ ctx[0].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*character*/ 1 && t1_value !== (t1_value = /*character*/ ctx[0].name + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Character', slots, []);
    	
    	let { character } = $$props;
    	const displayDetails = () => details.set(character);
    	const writable_props = ['character'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Character> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('character' in $$props) $$invalidate(0, character = $$props.character);
    	};

    	$$self.$capture_state = () => ({
    		getThumbnailSrc,
    		details,
    		character,
    		displayDetails
    	});

    	$$self.$inject_state = $$props => {
    		if ('character' in $$props) $$invalidate(0, character = $$props.character);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [character, displayDetails];
    }

    class Character extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { character: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Character",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*character*/ ctx[0] === undefined && !('character' in props)) {
    			console.warn("<Character> was created without expected prop 'character'");
    		}
    	}

    	get character() {
    		throw new Error("<Character>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set character(value) {
    		throw new Error("<Character>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Characters.svelte generated by Svelte v3.42.4 */

    const { Error: Error_1$1 } = globals;
    const file$5 = "src/components/Characters.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (13:2) {:else}
    function create_else_block(ctx) {
    	let error;
    	let current;

    	error = new Error$1({
    			props: { message: "Aucun résultat." },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(error.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(error, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(13:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (9:2) {#each characters as character}
    function create_each_block(ctx) {
    	let li;
    	let character;
    	let t;
    	let current;

    	character = new Character({
    			props: { character: /*character*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(character.$$.fragment);
    			t = space();
    			attr_dev(li, "class", "svelte-1nnhtfb");
    			add_location(li, file$5, 9, 4, 276);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(character, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const character_changes = {};
    			if (dirty & /*characters*/ 1) character_changes.character = /*character*/ ctx[1];
    			character.$set(character_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(character.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(character.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(character);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(9:2) {#each characters as character}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let ul;
    	let ul_intro;
    	let ul_outro;
    	let current;
    	let each_value = /*characters*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block(ctx);
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(ul, "class", "svelte-1nnhtfb");
    			add_location(ul, file$5, 7, 0, 176);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*characters*/ 1) {
    				each_value = /*characters*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (!each_value.length && each_1_else) {
    					each_1_else.p(ctx, dirty);
    				} else if (!each_value.length) {
    					each_1_else = create_else_block(ctx);
    					each_1_else.c();
    					transition_in(each_1_else, 1);
    					each_1_else.m(ul, null);
    				} else if (each_1_else) {
    					group_outros();

    					transition_out(each_1_else, 1, 1, () => {
    						each_1_else = null;
    					});

    					check_outros();
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (ul_outro) ul_outro.end(1);
    				ul_intro = create_in_transition(ul, fade, { duration: 200 });
    				ul_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (ul_intro) ul_intro.invalidate();
    			ul_outro = create_out_transition(ul, fade, { duration: 200 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    			if (detaching && ul_outro) ul_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Characters', slots, []);
    	
    	let { characters } = $$props;
    	const writable_props = ['characters'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Characters> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('characters' in $$props) $$invalidate(0, characters = $$props.characters);
    	};

    	$$self.$capture_state = () => ({ Character, Error: Error$1, fade, characters });

    	$$self.$inject_state = $$props => {
    		if ('characters' in $$props) $$invalidate(0, characters = $$props.characters);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [characters];
    }

    class Characters extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { characters: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Characters",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*characters*/ ctx[0] === undefined && !('characters' in props)) {
    			console.warn("<Characters> was created without expected prop 'characters'");
    		}
    	}

    	get characters() {
    		throw new Error_1$1("<Characters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set characters(value) {
    		throw new Error_1$1("<Characters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Logo.svelte generated by Svelte v3.42.4 */

    const file$4 = "src/components/Logo.svelte";

    function create_fragment$4(ctx) {
    	let h1;
    	let t0;
    	let span;
    	let t1;
    	let b0;
    	let t3;
    	let b1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text$1("M");
    			span = element("span");
    			t1 = text$1("AR");
    			b0 = element("b");
    			b0.textContent = "S";
    			t3 = text$1("VEL");
    			b1 = element("b");
    			b1.textContent = "TE";
    			attr_dev(b0, "class", "svelte-1bqf9ua");
    			add_location(b0, file$4, 0, 13, 13);
    			attr_dev(b1, "class", "svelte-1bqf9ua");
    			add_location(b1, file$4, 0, 24, 24);
    			add_location(span, file$4, 0, 5, 5);
    			attr_dev(h1, "class", "svelte-1bqf9ua");
    			add_location(h1, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			append_dev(h1, span);
    			append_dev(span, t1);
    			append_dev(span, b0);
    			append_dev(span, t3);
    			append_dev(span, b1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Logo', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Logo> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Logo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Logo",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/Navigation.svelte generated by Svelte v3.42.4 */
    const file$3 = "src/components/Navigation.svelte";

    // (10:0) {#if isVisible}
    function create_if_block$1(ctx) {
    	let nav;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let button0;
    	let t4;
    	let t5;
    	let button1;
    	let t6;
    	let nav_intro;
    	let nav_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			span = element("span");
    			t0 = text$1(/*currentPage*/ ctx[1]);
    			t1 = text$1(" / ");
    			t2 = text$1(/*numberOfPages*/ ctx[0]);
    			t3 = space();
    			button0 = element("button");
    			t4 = text$1("❮");
    			t5 = space();
    			button1 = element("button");
    			t6 = text$1("❯");
    			attr_dev(span, "class", "svelte-vyfmyo");
    			add_location(span, file$3, 11, 4, 410);
    			button0.disabled = /*isFirst*/ ctx[4];
    			attr_dev(button0, "class", "svelte-vyfmyo");
    			add_location(button0, file$3, 12, 4, 459);
    			button1.disabled = /*isLast*/ ctx[3];
    			attr_dev(button1, "class", "svelte-vyfmyo");
    			add_location(button1, file$3, 13, 4, 529);
    			attr_dev(nav, "class", "navigation svelte-vyfmyo");
    			add_location(nav, file$3, 10, 2, 344);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, span);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			append_dev(nav, t3);
    			append_dev(nav, button0);
    			append_dev(button0, t4);
    			append_dev(nav, t5);
    			append_dev(nav, button1);
    			append_dev(button1, t6);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", offset.decrement, false, false, false),
    					listen_dev(button1, "click", offset.increment, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*currentPage*/ 2) set_data_dev(t0, /*currentPage*/ ctx[1]);
    			if (!current || dirty & /*numberOfPages*/ 1) set_data_dev(t2, /*numberOfPages*/ ctx[0]);

    			if (!current || dirty & /*isFirst*/ 16) {
    				prop_dev(button0, "disabled", /*isFirst*/ ctx[4]);
    			}

    			if (!current || dirty & /*isLast*/ 8) {
    				prop_dev(button1, "disabled", /*isLast*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (nav_outro) nav_outro.end(1);
    				nav_intro = create_in_transition(nav, fade, { duration: 200 });
    				nav_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (nav_intro) nav_intro.invalidate();
    			nav_outro = create_out_transition(nav, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching && nav_outro) nav_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(10:0) {#if isVisible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*isVisible*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isVisible*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isVisible*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let isFirst;
    	let numberOfPages;
    	let currentPage;
    	let isLast;
    	let isVisible;
    	let $details;
    	let $offset;
    	let $total;
    	validate_store(details, 'details');
    	component_subscribe($$self, details, $$value => $$invalidate(5, $details = $$value));
    	validate_store(offset, 'offset');
    	component_subscribe($$self, offset, $$value => $$invalidate(6, $offset = $$value));
    	validate_store(total, 'total');
    	component_subscribe($$self, total, $$value => $$invalidate(7, $total = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navigation', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navigation> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		details,
    		offset,
    		total,
    		fade,
    		numberOfPages,
    		isVisible,
    		currentPage,
    		isLast,
    		isFirst,
    		$details,
    		$offset,
    		$total
    	});

    	$$self.$inject_state = $$props => {
    		if ('numberOfPages' in $$props) $$invalidate(0, numberOfPages = $$props.numberOfPages);
    		if ('isVisible' in $$props) $$invalidate(2, isVisible = $$props.isVisible);
    		if ('currentPage' in $$props) $$invalidate(1, currentPage = $$props.currentPage);
    		if ('isLast' in $$props) $$invalidate(3, isLast = $$props.isLast);
    		if ('isFirst' in $$props) $$invalidate(4, isFirst = $$props.isFirst);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$offset*/ 64) {
    			$$invalidate(4, isFirst = $offset === 0);
    		}

    		if ($$self.$$.dirty & /*$total*/ 128) {
    			$$invalidate(0, numberOfPages = Math.ceil($total / 20));
    		}

    		if ($$self.$$.dirty & /*$offset*/ 64) {
    			$$invalidate(1, currentPage = $offset / 20 + 1);
    		}

    		if ($$self.$$.dirty & /*numberOfPages, currentPage*/ 3) {
    			$$invalidate(3, isLast = numberOfPages === currentPage);
    		}

    		if ($$self.$$.dirty & /*numberOfPages, $details*/ 33) {
    			$$invalidate(2, isVisible = numberOfPages > 1 && !$details);
    		}
    	};

    	return [
    		numberOfPages,
    		currentPage,
    		isVisible,
    		isLast,
    		isFirst,
    		$details,
    		$offset,
    		$total
    	];
    }

    class Navigation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigation",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Search.svelte generated by Svelte v3.42.4 */

    const { console: console_1 } = globals;
    const file$2 = "src/components/Search.svelte";

    // (17:4) {#if query}
    function create_if_block(ctx) {
    	let closebutton;
    	let current;
    	closebutton = new CloseButton({ $$inline: true });
    	closebutton.$on("click", /*reset*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(closebutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(closebutton, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(closebutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(closebutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(closebutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(17:4) {#if query}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let form;
    	let input;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*query*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			form = element("form");
    			input = element("input");
    			t = space();
    			if (if_block) if_block.c();
    			input.disabled = /*disabled*/ ctx[0];
    			attr_dev(input, "type", "text");
    			add_location(input, file$2, 15, 4, 409);
    			attr_dev(form, "class", "search");
    			add_location(form, file$2, 14, 0, 347);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, input);
    			set_input_value(input, /*query*/ ctx[1]);
    			append_dev(form, t);
    			if (if_block) if_block.m(form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(form, "submit", prevent_default(/*onSubmit*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*disabled*/ 1) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[0]);
    			}

    			if (dirty & /*query*/ 2 && input.value !== /*query*/ ctx[1]) {
    				set_input_value(input, /*query*/ ctx[1]);
    			}

    			if (/*query*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*query*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(form, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Search', slots, []);
    	let { disabled = false } = $$props;
    	const dispatch = createEventDispatcher();
    	let query = null;

    	const onSubmit = () => {
    		dispatch("submit", { query });
    	};

    	const reset = () => {
    		$$invalidate(1, query = null);
    	};

    	const writable_props = ['disabled'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Search> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		query = this.value;
    		$$invalidate(1, query);
    	}

    	$$self.$$set = $$props => {
    		if ('disabled' in $$props) $$invalidate(0, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		CloseButton,
    		disabled,
    		dispatch,
    		query,
    		onSubmit,
    		reset
    	});

    	$$self.$inject_state = $$props => {
    		if ('disabled' in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ('query' in $$props) $$invalidate(1, query = $$props.query);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*query*/ 2) {
    			console.log({ query });
    		}
    	};

    	return [disabled, query, onSubmit, reset, input_input_handler];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { disabled: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get disabled() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.42.4 */
    const file$1 = "src/components/Header.svelte";

    function create_fragment$1(ctx) {
    	let header;
    	let logo;
    	let t0;
    	let search;
    	let t1;
    	let navigation;
    	let current;
    	logo = new Logo({ $$inline: true });

    	search = new Search({
    			props: { disabled: !!/*$details*/ ctx[0] },
    			$$inline: true
    		});

    	search.$on("submit", /*onSubmit*/ ctx[1]);
    	navigation = new Navigation({ $$inline: true });

    	const block = {
    		c: function create() {
    			header = element("header");
    			create_component(logo.$$.fragment);
    			t0 = space();
    			create_component(search.$$.fragment);
    			t1 = space();
    			create_component(navigation.$$.fragment);
    			attr_dev(header, "class", "svelte-ldiuaj");
    			add_location(header, file$1, 11, 0, 312);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			mount_component(logo, header, null);
    			append_dev(header, t0);
    			mount_component(search, header, null);
    			append_dev(header, t1);
    			mount_component(navigation, header, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const search_changes = {};
    			if (dirty & /*$details*/ 1) search_changes.disabled = !!/*$details*/ ctx[0];
    			search.$set(search_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logo.$$.fragment, local);
    			transition_in(search.$$.fragment, local);
    			transition_in(navigation.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logo.$$.fragment, local);
    			transition_out(search.$$.fragment, local);
    			transition_out(navigation.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(logo);
    			destroy_component(search);
    			destroy_component(navigation);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $details;
    	validate_store(details, 'details');
    	component_subscribe($$self, details, $$value => $$invalidate(0, $details = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);

    	const onSubmit = ({ detail }) => {
    		details.set(null);
    		offset.set(0);
    		query.set(detail.query);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Logo,
    		Navigation,
    		details,
    		offset,
    		query,
    		Search,
    		onSubmit,
    		$details
    	});

    	return [$details, onSubmit];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/App.svelte generated by Svelte v3.42.4 */

    const { Error: Error_1 } = globals;
    const file = "src/components/App.svelte";

    // (16:2) {:catch}
    function create_catch_block(ctx) {
    	let error;
    	let current;

    	error = new Error$1({
    			props: {
    				message: "Impossible de d'afficher la liste des personnages à cause d'une erreur technique."
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(error.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(error, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(16:2) {:catch}",
    		ctx
    	});

    	return block;
    }

    // (14:2) {:then characters}
    function create_then_block(ctx) {
    	let characters;
    	let current;

    	characters = new Characters({
    			props: { characters: /*characters*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(characters.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(characters, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const characters_changes = {};
    			if (dirty & /*$query, $offset*/ 3) characters_changes.characters = /*characters*/ ctx[2];
    			characters.$set(characters_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(characters.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(characters.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(characters, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(14:2) {:then characters}",
    		ctx
    	});

    	return block;
    }

    // (12:43)      <Loader centered />   {:then characters}
    function create_pending_block(ctx) {
    	let loader;
    	let current;

    	loader = new Loader({
    			props: { centered: true },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(loader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loader, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(12:43)      <Loader centered />   {:then characters}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let header;
    	let t0;
    	let main;
    	let promise;
    	let t1;
    	let characterdetails;
    	let current;
    	header = new Header({ $$inline: true });

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 2,
    		blocks: [,,,]
    	};

    	handle_promise(promise = fetchCharacters(/*$query*/ ctx[0], /*$offset*/ ctx[1]), info);
    	characterdetails = new CharacterDetails({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			info.block.c();
    			t1 = space();
    			create_component(characterdetails.$$.fragment);
    			attr_dev(main, "class", "svelte-52izmq");
    			add_location(main, file, 10, 0, 354);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = t1;
    			append_dev(main, t1);
    			mount_component(characterdetails, main, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*$query, $offset*/ 3 && promise !== (promise = fetchCharacters(/*$query*/ ctx[0], /*$offset*/ ctx[1])) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(info.block);
    			transition_in(characterdetails.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);

    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(characterdetails.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    			destroy_component(characterdetails);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $query;
    	let $offset;
    	validate_store(query, 'query');
    	component_subscribe($$self, query, $$value => $$invalidate(0, $query = $$value));
    	validate_store(offset, 'offset');
    	component_subscribe($$self, offset, $$value => $$invalidate(1, $offset = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		CharacterDetails,
    		Characters,
    		Error: Error$1,
    		Header,
    		Loader,
    		fetchCharacters,
    		offset,
    		query,
    		$query,
    		$offset
    	});

    	return [$query, $offset];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var statuses = {
    	"100": "Continue",
    	"101": "Switching Protocols",
    	"102": "Processing",
    	"103": "Early Hints",
    	"200": "OK",
    	"201": "Created",
    	"202": "Accepted",
    	"203": "Non-Authoritative Information",
    	"204": "No Content",
    	"205": "Reset Content",
    	"206": "Partial Content",
    	"207": "Multi-Status",
    	"208": "Already Reported",
    	"226": "IM Used",
    	"300": "Multiple Choices",
    	"301": "Moved Permanently",
    	"302": "Found",
    	"303": "See Other",
    	"304": "Not Modified",
    	"305": "Use Proxy",
    	"307": "Temporary Redirect",
    	"308": "Permanent Redirect",
    	"400": "Bad Request",
    	"401": "Unauthorized",
    	"402": "Payment Required",
    	"403": "Forbidden",
    	"404": "Not Found",
    	"405": "Method Not Allowed",
    	"406": "Not Acceptable",
    	"407": "Proxy Authentication Required",
    	"408": "Request Timeout",
    	"409": "Conflict",
    	"410": "Gone",
    	"411": "Length Required",
    	"412": "Precondition Failed",
    	"413": "Payload Too Large",
    	"414": "URI Too Long",
    	"415": "Unsupported Media Type",
    	"416": "Range Not Satisfiable",
    	"417": "Expectation Failed",
    	"418": "I'm a Teapot",
    	"421": "Misdirected Request",
    	"422": "Unprocessable Entity",
    	"423": "Locked",
    	"424": "Failed Dependency",
    	"425": "Too Early",
    	"426": "Upgrade Required",
    	"428": "Precondition Required",
    	"429": "Too Many Requests",
    	"431": "Request Header Fields Too Large",
    	"451": "Unavailable For Legal Reasons",
    	"500": "Internal Server Error",
    	"501": "Not Implemented",
    	"502": "Bad Gateway",
    	"503": "Service Unavailable",
    	"504": "Gateway Timeout",
    	"505": "HTTP Version Not Supported",
    	"506": "Variant Also Negotiates",
    	"507": "Insufficient Storage",
    	"508": "Loop Detected",
    	"509": "Bandwidth Limit Exceeded",
    	"510": "Not Extended",
    	"511": "Network Authentication Required"
    };

    /**
     * Sets a response status code and text.
     * @example
     * res(ctx.status(301))
     * res(ctx.status(400, 'Custom status text'))
     * @see {@link https://mswjs.io/docs/api/context/status `ctx.status()`}
     */
    const status$3 = (statusCode, statusText) => {
        return (res) => {
            res.status = statusCode;
            res.statusText =
                statusText || statuses[String(statusCode)];
            return res;
        };
    };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    var lib$1$1 = {};

    var Headers = {};

    var normalizeHeaderName$1 = {};

    Object.defineProperty(normalizeHeaderName$1, "__esModule", { value: true });
    normalizeHeaderName$1.normalizeHeaderName = void 0;
    var HEADERS_INVALID_CHARACTERS = /[^a-z0-9\-#$%&'*+.^_`|~]/i;
    function normalizeHeaderName(name) {
        if (typeof name !== 'string') {
            name = String(name);
        }
        if (HEADERS_INVALID_CHARACTERS.test(name) || name.trim() === '') {
            throw new TypeError('Invalid character in header field name');
        }
        return name.toLowerCase();
    }
    normalizeHeaderName$1.normalizeHeaderName = normalizeHeaderName;

    var normalizeHeaderValue$1 = {};

    Object.defineProperty(normalizeHeaderValue$1, "__esModule", { value: true });
    normalizeHeaderValue$1.normalizeHeaderValue = void 0;
    function normalizeHeaderValue(value) {
        if (typeof value !== 'string') {
            value = String(value);
        }
        return value;
    }
    normalizeHeaderValue$1.normalizeHeaderValue = normalizeHeaderValue;

    var __generator$3 = (commonjsGlobal && commonjsGlobal.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var __read$3 = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __values$1 = (commonjsGlobal && commonjsGlobal.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(Headers, "__esModule", { value: true });
    var normalizeHeaderName_1 = normalizeHeaderName$1;
    var normalizeHeaderValue_1 = normalizeHeaderValue$1;
    var HeadersPolyfill = /** @class */ (function () {
        function HeadersPolyfill(init) {
            var _this = this;
            // Normalized header {"name":"a, b"} storage.
            this._headers = {};
            // Keeps the mapping between the raw header name
            // and the normalized header name to ease the lookup.
            this._names = new Map();
            /**
             * @note Cannot check if the `init` is an instance of the `Headers`
             * because that class is only defined in the browser.
             */
            if (['Headers', 'HeadersPolyfill'].includes(init === null || init === void 0 ? void 0 : init.constructor.name) ||
                init instanceof HeadersPolyfill) {
                var initialHeaders = init;
                initialHeaders.forEach(function (value, name) {
                    _this.append(name, value);
                }, this);
            }
            else if (Array.isArray(init)) {
                init.forEach(function (_a) {
                    var _b = __read$3(_a, 2), name = _b[0], value = _b[1];
                    _this.append(name, Array.isArray(value) ? value.join(', ') : value);
                });
            }
            else if (init) {
                Object.getOwnPropertyNames(init).forEach(function (name) {
                    var value = init[name];
                    _this.append(name, Array.isArray(value) ? value.join(', ') : value);
                });
            }
        }
        HeadersPolyfill.prototype[Symbol.iterator] = function () {
            return this.entries();
        };
        HeadersPolyfill.prototype.keys = function () {
            var _a, _b, name_1, e_1_1;
            var e_1, _c;
            return __generator$3(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, 6, 7]);
                        _a = __values$1(Object.keys(this._headers)), _b = _a.next();
                        _d.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        name_1 = _b.value;
                        return [4 /*yield*/, name_1];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_1_1 = _d.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        };
        HeadersPolyfill.prototype.values = function () {
            var _a, _b, value, e_2_1;
            var e_2, _c;
            return __generator$3(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, 6, 7]);
                        _a = __values$1(Object.values(this._headers)), _b = _a.next();
                        _d.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        value = _b.value;
                        return [4 /*yield*/, value];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_2_1 = _d.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        };
        HeadersPolyfill.prototype.entries = function () {
            var _a, _b, name_2, e_3_1;
            var e_3, _c;
            return __generator$3(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, 6, 7]);
                        _a = __values$1(Object.keys(this._headers)), _b = _a.next();
                        _d.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        name_2 = _b.value;
                        return [4 /*yield*/, [name_2, this.get(name_2)]];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_3_1 = _d.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        };
        /**
         * Returns a `ByteString` sequence of all the values of a header with a given name.
         */
        HeadersPolyfill.prototype.get = function (name) {
            return this._headers[normalizeHeaderName_1.normalizeHeaderName(name)] || null;
        };
        /**
         * Sets a new value for an existing header inside a `Headers` object, or adds the header if it does not already exist.
         */
        HeadersPolyfill.prototype.set = function (name, value) {
            var normalizedName = normalizeHeaderName_1.normalizeHeaderName(name);
            this._headers[normalizedName] = normalizeHeaderValue_1.normalizeHeaderValue(value);
            this._names.set(normalizedName, name);
        };
        /**
         * Appends a new value onto an existing header inside a `Headers` object, or adds the header if it does not already exist.
         */
        HeadersPolyfill.prototype.append = function (name, value) {
            var resolvedValue = this.has(name) ? this.get(name) + ", " + value : value;
            this.set(name, resolvedValue);
        };
        /**
         * Deletes a header from the `Headers` object.
         */
        HeadersPolyfill.prototype.delete = function (name) {
            if (!this.has(name)) {
                return this;
            }
            var normalizedName = normalizeHeaderName_1.normalizeHeaderName(name);
            delete this._headers[normalizedName];
            this._names.delete(normalizedName);
            return this;
        };
        /**
         * Returns the object of all the normalized headers.
         */
        HeadersPolyfill.prototype.all = function () {
            return this._headers;
        };
        /**
         * Returns the object of all the raw headers.
         */
        HeadersPolyfill.prototype.raw = function () {
            var _this = this;
            return Object.entries(this._headers).reduce(function (headers, _a) {
                var _b = __read$3(_a, 2), name = _b[0], value = _b[1];
                headers[_this._names.get(name)] = value;
                return headers;
            }, {});
        };
        /**
         * Returns a boolean stating whether a `Headers` object contains a certain header.
         */
        HeadersPolyfill.prototype.has = function (name) {
            return this._headers.hasOwnProperty(normalizeHeaderName_1.normalizeHeaderName(name));
        };
        /**
         * Traverses the `Headers` object,
         * calling the given callback for each header.
         */
        HeadersPolyfill.prototype.forEach = function (callback, thisArg) {
            for (var name_3 in this._headers) {
                if (this._headers.hasOwnProperty(name_3)) {
                    callback.call(thisArg, this._headers[name_3], name_3, this);
                }
            }
        };
        return HeadersPolyfill;
    }());
    Headers.default = HeadersPolyfill;

    var headersToString$1 = {};

    var headersToList$1 = {};

    Object.defineProperty(headersToList$1, "__esModule", { value: true });
    headersToList$1.headersToList = void 0;
    function headersToList(headers) {
        var headersList = [];
        headers.forEach(function (value, name) {
            var resolvedValue = value.includes(',')
                ? value.split(',').map(function (value) { return value.trim(); })
                : value;
            headersList.push([name, resolvedValue]);
        });
        return headersList;
    }
    headersToList$1.headersToList = headersToList;

    var __read$2 = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    Object.defineProperty(headersToString$1, "__esModule", { value: true });
    headersToString$1.headersToString = void 0;
    var headersToList_1 = headersToList$1;
    /**
     * Converts a given `Headers` instance to its string representation.
     */
    function headersToString(headers) {
        var list = headersToList_1.headersToList(headers);
        var lines = list.map(function (_a) {
            var _b = __read$2(_a, 2), name = _b[0], value = _b[1];
            var values = [].concat(value);
            return name + ": " + values.join(', ');
        });
        return lines.join('\r\n');
    }
    headersToString$1.headersToString = headersToString;

    var headersToObject$1 = {};

    Object.defineProperty(headersToObject$1, "__esModule", { value: true });
    headersToObject$1.headersToObject = void 0;
    // List of headers that cannot have multiple values,
    // while potentially having a comma in their single value.
    var singleValueHeaders = ['user-agent'];
    /**
     * Converts a given `Headers` instance into a plain object.
     * Respects headers with multiple values.
     */
    function headersToObject(headers) {
        var headersObject = {};
        headers.forEach(function (value, name) {
            var isMultiValue = !singleValueHeaders.includes(name.toLowerCase()) && value.includes(',');
            headersObject[name] = isMultiValue
                ? value.split(',').map(function (s) { return s.trim(); })
                : value;
        });
        return headersObject;
    }
    headersToObject$1.headersToObject = headersToObject;

    var stringToHeaders$1 = {};

    Object.defineProperty(stringToHeaders$1, "__esModule", { value: true });
    stringToHeaders$1.stringToHeaders = void 0;
    var Headers_1$2 = Headers;
    /**
     * Converts a string representation of headers (i.e. from XMLHttpRequest)
     * to a new `Headers` instance.
     */
    function stringToHeaders(str) {
        var lines = str.trim().split(/[\r\n]+/);
        return lines.reduce(function (headers, line) {
            var parts = line.split(': ');
            var name = parts.shift();
            var value = parts.join(': ');
            headers.append(name, value);
            return headers;
        }, new Headers_1$2.default());
    }
    stringToHeaders$1.stringToHeaders = stringToHeaders;

    var listToHeaders$1 = {};

    var __read$1$1 = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    Object.defineProperty(listToHeaders$1, "__esModule", { value: true });
    listToHeaders$1.listToHeaders = void 0;
    var Headers_1$1 = Headers;
    function listToHeaders(list) {
        var headers = new Headers_1$1.default();
        list.forEach(function (_a) {
            var _b = __read$1$1(_a, 2), name = _b[0], value = _b[1];
            var values = [].concat(value);
            values.forEach(function (value) {
                headers.append(name, value);
            });
        });
        return headers;
    }
    listToHeaders$1.listToHeaders = listToHeaders;

    var objectToHeaders$1 = {};

    var reduceHeadersObject$1 = {};

    Object.defineProperty(reduceHeadersObject$1, "__esModule", { value: true });
    reduceHeadersObject$1.reduceHeadersObject = void 0;
    /**
     * Reduces given headers object instnace.
     */
    function reduceHeadersObject(headers, reducer, initialState) {
        return Object.keys(headers).reduce(function (nextHeaders, name) {
            return reducer(nextHeaders, name, headers[name]);
        }, initialState);
    }
    reduceHeadersObject$1.reduceHeadersObject = reduceHeadersObject;

    Object.defineProperty(objectToHeaders$1, "__esModule", { value: true });
    objectToHeaders$1.objectToHeaders = void 0;
    var Headers_1 = Headers;
    var reduceHeadersObject_1$1 = reduceHeadersObject$1;
    /**
     * Converts a given headers object to a new `Headers` instance.
     */
    function objectToHeaders(headersObject) {
        return reduceHeadersObject_1$1.reduceHeadersObject(headersObject, function (headers, name, value) {
            var values = [].concat(value).filter(Boolean);
            values.forEach(function (value) {
                headers.append(name, value);
            });
            return headers;
        }, new Headers_1.default());
    }
    objectToHeaders$1.objectToHeaders = objectToHeaders;

    var flattenHeadersList$1 = {};

    var __read$4 = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    Object.defineProperty(flattenHeadersList$1, "__esModule", { value: true });
    flattenHeadersList$1.flattenHeadersList = void 0;
    function flattenHeadersList(list) {
        return list.map(function (_a) {
            var _b = __read$4(_a, 2), name = _b[0], values = _b[1];
            return [name, [].concat(values).join('; ')];
        });
    }
    flattenHeadersList$1.flattenHeadersList = flattenHeadersList;

    var flattenHeadersObject$1 = {};

    Object.defineProperty(flattenHeadersObject$1, "__esModule", { value: true });
    flattenHeadersObject$1.flattenHeadersObject = void 0;
    var reduceHeadersObject_1 = reduceHeadersObject$1;
    function flattenHeadersObject(headersObject) {
        return reduceHeadersObject_1.reduceHeadersObject(headersObject, function (headers, name, value) {
            headers[name] = [].concat(value).join('; ');
            return headers;
        }, {});
    }
    flattenHeadersObject$1.flattenHeadersObject = flattenHeadersObject;

    (function (exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.flattenHeadersObject = exports.flattenHeadersList = exports.reduceHeadersObject = exports.objectToHeaders = exports.listToHeaders = exports.stringToHeaders = exports.headersToObject = exports.headersToList = exports.headersToString = exports.Headers = void 0;
    var Headers_1 = Headers;
    Object.defineProperty(exports, "Headers", { enumerable: true, get: function () { return Headers_1.default; } });
    var headersToString_1 = headersToString$1;
    Object.defineProperty(exports, "headersToString", { enumerable: true, get: function () { return headersToString_1.headersToString; } });
    var headersToList_1 = headersToList$1;
    Object.defineProperty(exports, "headersToList", { enumerable: true, get: function () { return headersToList_1.headersToList; } });
    var headersToObject_1 = headersToObject$1;
    Object.defineProperty(exports, "headersToObject", { enumerable: true, get: function () { return headersToObject_1.headersToObject; } });
    var stringToHeaders_1 = stringToHeaders$1;
    Object.defineProperty(exports, "stringToHeaders", { enumerable: true, get: function () { return stringToHeaders_1.stringToHeaders; } });
    var listToHeaders_1 = listToHeaders$1;
    Object.defineProperty(exports, "listToHeaders", { enumerable: true, get: function () { return listToHeaders_1.listToHeaders; } });
    var objectToHeaders_1 = objectToHeaders$1;
    Object.defineProperty(exports, "objectToHeaders", { enumerable: true, get: function () { return objectToHeaders_1.objectToHeaders; } });
    var reduceHeadersObject_1 = reduceHeadersObject$1;
    Object.defineProperty(exports, "reduceHeadersObject", { enumerable: true, get: function () { return reduceHeadersObject_1.reduceHeadersObject; } });
    var flattenHeadersList_1 = flattenHeadersList$1;
    Object.defineProperty(exports, "flattenHeadersList", { enumerable: true, get: function () { return flattenHeadersList_1.flattenHeadersList; } });
    var flattenHeadersObject_1 = flattenHeadersObject$1;
    Object.defineProperty(exports, "flattenHeadersObject", { enumerable: true, get: function () { return flattenHeadersObject_1.flattenHeadersObject; } });
    }(lib$1$1));

    /**
     * Sets one or multiple response headers.
     * @example
     * ctx.set('Content-Type', 'text/plain')
     * ctx.set({
     *   'Accept': 'application/javascript',
     *   'Content-Type': "text/plain"
     * })
     * @see {@link https://mswjs.io/docs/api/context/set `ctx.set()`}
     */
    function set(...args) {
        return (res) => {
            const [name, value] = args;
            if (typeof name === 'string') {
                res.headers.append(name, value);
            }
            else {
                const headers = lib$1$1.objectToHeaders(name);
                headers.forEach((value, name) => {
                    res.headers.append(name, value);
                });
            }
            return res;
        };
    }

    /*!
     * cookie
     * Copyright(c) 2012-2014 Roman Shtylman
     * Copyright(c) 2015 Douglas Christopher Wilson
     * MIT Licensed
     */

    /**
     * Module exports.
     * @public
     */

    var parse_1 = parse$4;
    var serialize_1 = serialize;

    /**
     * Module variables.
     * @private
     */

    var decode = decodeURIComponent;
    var encode = encodeURIComponent;
    var pairSplitRegExp = /; */;

    /**
     * RegExp to match field-content in RFC 7230 sec 3.2
     *
     * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
     * field-vchar   = VCHAR / obs-text
     * obs-text      = %x80-FF
     */

    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

    /**
     * Parse a cookie header.
     *
     * Parse the given cookie header string into an object
     * The object has the various cookies as keys(names) => values
     *
     * @param {string} str
     * @param {object} [options]
     * @return {object}
     * @public
     */

    function parse$4(str, options) {
      if (typeof str !== 'string') {
        throw new TypeError('argument str must be a string');
      }

      var obj = {};
      var opt = options || {};
      var pairs = str.split(pairSplitRegExp);
      var dec = opt.decode || decode;

      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var eq_idx = pair.indexOf('=');

        // skip things that don't look like key=value
        if (eq_idx < 0) {
          continue;
        }

        var key = pair.substr(0, eq_idx).trim();
        var val = pair.substr(++eq_idx, pair.length).trim();

        // quoted values
        if ('"' == val[0]) {
          val = val.slice(1, -1);
        }

        // only assign once
        if (undefined == obj[key]) {
          obj[key] = tryDecode(val, dec);
        }
      }

      return obj;
    }

    /**
     * Serialize data into a cookie header.
     *
     * Serialize the a name value pair into a cookie string suitable for
     * http headers. An optional options object specified cookie parameters.
     *
     * serialize('foo', 'bar', { httpOnly: true })
     *   => "foo=bar; httpOnly"
     *
     * @param {string} name
     * @param {string} val
     * @param {object} [options]
     * @return {string}
     * @public
     */

    function serialize(name, val, options) {
      var opt = options || {};
      var enc = opt.encode || encode;

      if (typeof enc !== 'function') {
        throw new TypeError('option encode is invalid');
      }

      if (!fieldContentRegExp.test(name)) {
        throw new TypeError('argument name is invalid');
      }

      var value = enc(val);

      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError('argument val is invalid');
      }

      var str = name + '=' + value;

      if (null != opt.maxAge) {
        var maxAge = opt.maxAge - 0;

        if (isNaN(maxAge) || !isFinite(maxAge)) {
          throw new TypeError('option maxAge is invalid')
        }

        str += '; Max-Age=' + Math.floor(maxAge);
      }

      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError('option domain is invalid');
        }

        str += '; Domain=' + opt.domain;
      }

      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError('option path is invalid');
        }

        str += '; Path=' + opt.path;
      }

      if (opt.expires) {
        if (typeof opt.expires.toUTCString !== 'function') {
          throw new TypeError('option expires is invalid');
        }

        str += '; Expires=' + opt.expires.toUTCString();
      }

      if (opt.httpOnly) {
        str += '; HttpOnly';
      }

      if (opt.secure) {
        str += '; Secure';
      }

      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === 'string'
          ? opt.sameSite.toLowerCase() : opt.sameSite;

        switch (sameSite) {
          case true:
            str += '; SameSite=Strict';
            break;
          case 'lax':
            str += '; SameSite=Lax';
            break;
          case 'strict':
            str += '; SameSite=Strict';
            break;
          case 'none':
            str += '; SameSite=None';
            break;
          default:
            throw new TypeError('option sameSite is invalid');
        }
      }

      return str;
    }

    /**
     * Try decoding a string using a decoding function.
     *
     * @param {string} str
     * @param {function} decode
     * @private
     */

    function tryDecode(str, decode) {
      try {
        return decode(str);
      } catch (e) {
        return str;
      }
    }

    /**
     * Sets a given cookie on the mocked response.
     * @example res(ctx.cookie('name', 'value'))
     */
    const cookie = (name, value, options) => {
        return (res) => {
            const serializedCookie = serialize_1(name, value, options);
            res.headers.set('Set-Cookie', serializedCookie);
            if (typeof document !== 'undefined') {
                document.cookie = serializedCookie;
            }
            return res;
        };
    };

    /**
     * Parses a given string into a JSON.
     * Does not throw an exception on an invalid JSON string.
     */
    function jsonParse(str) {
        try {
            return JSON.parse(str);
        }
        catch (error) {
            return undefined;
        }
    }

    /**
     * Sets the given value as the JSON body of the response.
     * Appends a `Content-Type: application/json` header on the
     * mocked response.
     * @example
     * res(ctx.json('Some string'))
     * res(ctx.json({ key: 'value' }))
     * res(ctx.json([1, '2', false, { ok: true }]))
     * @see {@link https://mswjs.io/docs/api/context/json `ctx.json()`}
     */
    const json = (body) => {
        return (res) => {
            res.headers.set('Content-Type', 'application/json');
            res.body = JSON.stringify(body);
            return res;
        };
    };

    var lib$5 = {exports: {}};

    (function (module, exports) {
    (function (global, factory) {
      factory(exports) ;
    }(commonjsGlobal, (function (exports) {
      /**
       * Determines if the current process is a Node.js process.
       */
      function isNodeProcess() {
          if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
              return true;
          }
          return !!(typeof process !== 'undefined' &&
              process.versions &&
              process.versions.node);
      }

      exports.isNodeProcess = isNodeProcess;

      Object.defineProperty(exports, '__esModule', { value: true });

    })));
    }(lib$5, lib$5.exports));

    const SET_TIMEOUT_MAX_ALLOWED_INT = 2147483647;
    const MIN_SERVER_RESPONSE_TIME = 100;
    const MAX_SERVER_RESPONSE_TIME = 400;
    const NODE_SERVER_RESPONSE_TIME = 5;
    const getRandomServerResponseTime = () => {
        if (lib$5.exports.isNodeProcess()) {
            return NODE_SERVER_RESPONSE_TIME;
        }
        return Math.floor(Math.random() * (MAX_SERVER_RESPONSE_TIME - MIN_SERVER_RESPONSE_TIME) +
            MIN_SERVER_RESPONSE_TIME);
    };
    /**
     * Delays the response by the given duration (ms).
     * @example
     * res(ctx.delay(1200)) // delay response by 1200ms
     * res(ctx.delay()) // emulate realistic server response time
     * res(ctx.delay('infinite')) // delay response infinitely
     * @see {@link https://mswjs.io/docs/api/context/delay `ctx.delay()`}
     */
    const delay = (durationOrMode) => {
        return (res) => {
            let delayTime;
            if (typeof durationOrMode === 'string') {
                switch (durationOrMode) {
                    case 'infinite': {
                        // Using `Infinity` as a delay value executes the response timeout immediately.
                        // Instead, use the maximum allowed integer for `setTimeout`.
                        delayTime = SET_TIMEOUT_MAX_ALLOWED_INT;
                        break;
                    }
                    case 'real': {
                        delayTime = getRandomServerResponseTime();
                        break;
                    }
                    default: {
                        throw new Error(`Failed to delay a response: unknown delay mode "${durationOrMode}". Please make sure you provide one of the supported modes ("real", "infinite") or a number to "ctx.delay".`);
                    }
                }
            }
            else if (typeof durationOrMode === 'undefined') {
                // Use random realistic server response time when no explicit delay duration was provided.
                delayTime = getRandomServerResponseTime();
            }
            else {
                // Guard against passing values like `Infinity` or `Number.MAX_VALUE`
                // as the response delay duration. They don't produce the result you may expect.
                if (durationOrMode > SET_TIMEOUT_MAX_ALLOWED_INT) {
                    throw new Error(`Failed to delay a response: provided delay duration (${durationOrMode}) exceeds the maximum allowed duration for "setTimeout" (${SET_TIMEOUT_MAX_ALLOWED_INT}). This will cause the response to be returned immediately. Please use a number within the allowed range to delay the response by exact duration, or consider the "infinite" delay mode to delay the response indefinitely.`);
                }
                delayTime = durationOrMode;
            }
            res.delay = delayTime;
            return res;
        };
    };

    const useFetch = lib$5.exports.isNodeProcess() ? require('node-fetch') : window.fetch;
    const augmentRequestInit = (requestInit) => {
        const headers = new lib$1$1.Headers(requestInit.headers);
        headers.set('x-msw-bypass', 'true');
        return Object.assign(Object.assign({}, requestInit), { headers: headers.all() });
    };
    const createFetchRequestParameters = (input) => {
        const { body, method } = input;
        const requestParameters = Object.assign(Object.assign({}, input), { body: undefined });
        if (['GET', 'HEAD'].includes(method)) {
            return requestParameters;
        }
        requestParameters.body =
            typeof body === 'object' ? JSON.stringify(body) : body;
        return requestParameters;
    };
    /**
     * Performs a bypassed request inside a request handler.
     * @example
     * const originalResponse = await ctx.fetch(req)
     * @see {@link https://mswjs.io/docs/api/context/fetch `ctx.fetch()`}
     */
    const fetch$2 = (input, requestInit = {}) => {
        if (typeof input === 'string') {
            return useFetch(input, augmentRequestInit(requestInit));
        }
        const requestParameters = createFetchRequestParameters(input);
        const derivedRequestInit = augmentRequestInit(requestParameters);
        return useFetch(input.url.href, derivedRequestInit);
    };

    /**
     * Sets a raw response body. Does not append any `Content-Type` headers.
     * @example
     * res(ctx.body('Successful response'))
     * res(ctx.body(JSON.stringify({ key: 'value' })))
     * @see {@link https://mswjs.io/docs/api/context/body `ctx.body()`}
     */
    const body = (value) => {
        return (res) => {
            res.body = value;
            return res;
        };
    };

    /**
     * Sets a textual response body. Appends a `Content-Type: text/plain`
     * header on the mocked response.
     * @example res(ctx.text('Successful response'))
     * @see {@link https://mswjs.io/docs/api/context/text `ctx.text()`}
     */
    const text = (body) => {
        return (res) => {
            res.headers.set('Content-Type', 'text/plain');
            res.body = body;
            return res;
        };
    };

    /**
     * Sets an XML response body. Appends a `Content-Type: text/xml` header
     * on the mocked response.
     * @example
     * res(ctx.xml('<node key="value">Content</node>'))
     * @see {@link https://mswjs.io/docs/api/context/xml `ctx.xml()`}
     */
    const xml = (body) => {
        return (res) => {
            res.headers.set('Content-Type', 'text/xml');
            res.body = body;
            return res;
        };
    };

    /**
     * Determines if the given value is an object.
     */
    function isObject(value) {
        return value != null && typeof value === 'object' && !Array.isArray(value);
    }

    /**
     * Deeply merges two given objects with the right one
     * having a priority during property assignment.
     */
    function mergeRight(left, right) {
        return Object.entries(right).reduce((result, [key, rightValue]) => {
            const leftValue = result[key];
            if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
                result[key] = leftValue.concat(rightValue);
                return result;
            }
            if (isObject(leftValue) && isObject(rightValue)) {
                result[key] = mergeRight(leftValue, rightValue);
                return result;
            }
            result[key] = rightValue;
            return result;
        }, Object.assign({}, left));
    }

    /**
     * Sets a given payload as a GraphQL response body.
     * @example
     * res(ctx.data({ user: { firstName: 'John' }}))
     * @see {@link https://mswjs.io/docs/api/context/data `ctx.data()`}
     */
    const data$3 = (payload) => {
        return (res) => {
            const prevBody = jsonParse(res.body) || {};
            const nextBody = mergeRight(prevBody, { data: payload });
            return json(nextBody)(res);
        };
    };

    /**
     * Sets a given list of GraphQL errors on the mocked response.
     * @example res(ctx.errors([{ message: 'Unauthorized' }]))
     * @see {@link https://mswjs.io/docs/api/context/errors}
     */
    const errors = (errorsList) => {
        return (res) => {
            if (errorsList == null) {
                return res;
            }
            const prevBody = jsonParse(res.body) || {};
            const nextBody = mergeRight(prevBody, { errors: errorsList });
            return json(nextBody)(res);
        };
    };

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __awaiter$3(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    var lib$4 = {};

    var invariant$1 = {};

    var format$1 = {};

    Object.defineProperty(format$1, "__esModule", { value: true });
    format$1.format = void 0;
    var POSITIONALS_EXP = /(%?)(%([sdjo]))/g;
    function serializePositional(positional, flag) {
        switch (flag) {
            // Strings.
            case 's':
                return positional;
            // Digits.
            case 'd':
            case 'i':
                return Number(positional);
            // JSON.
            case 'j':
                return JSON.stringify(positional);
            // Objects.
            case 'o': {
                // Preserve stings to prevent extra quotes around them.
                if (typeof positional === 'string') {
                    return positional;
                }
                var json = JSON.stringify(positional);
                // If the positional isn't serializable, return it as-is.
                if (json === '{}' || json === '[]' || /^\[object .+?\]$/.test(json)) {
                    return positional;
                }
                return json;
            }
        }
    }
    function format(message) {
        var positionals = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            positionals[_i - 1] = arguments[_i];
        }
        if (positionals.length === 0) {
            return message;
        }
        var positionalIndex = 0;
        var formattedMessage = message.replace(POSITIONALS_EXP, function (match, isEscaped, _, flag) {
            var positional = positionals[positionalIndex];
            var value = serializePositional(positional, flag);
            if (!isEscaped) {
                positionalIndex++;
                return value;
            }
            return match;
        });
        // Append unresolved positionals to string as-is.
        if (positionalIndex < positionals.length) {
            formattedMessage += " " + positionals.slice(positionalIndex).join(' ');
        }
        formattedMessage = formattedMessage.replace(/%{2,2}/g, '%');
        return formattedMessage;
    }
    format$1.format = format;

    var __extends$2 = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from) {
        for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
            to[j] = from[i];
        return to;
    };
    Object.defineProperty(invariant$1, "__esModule", { value: true });
    invariant$1.invariant = invariant$1.InvariantError = void 0;
    var format_1 = format$1;
    var STACK_FRAMES_TO_IGNORE = 2;
    var InvariantError = /** @class */ (function (_super) {
        __extends$2(InvariantError, _super);
        function InvariantError(message) {
            var positionals = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                positionals[_i - 1] = arguments[_i];
            }
            var _this = _super.call(this, message) || this;
            _this.name = 'Invariant Violation';
            _this.message = format_1.format.apply(void 0, __spreadArray([message], positionals));
            if (_this.stack) {
                var prevStack = _this.stack;
                _this.stack = prevStack
                    .split('\n')
                    .slice(STACK_FRAMES_TO_IGNORE)
                    .join('\n');
            }
            return _this;
        }
        return InvariantError;
    }(Error));
    invariant$1.InvariantError = InvariantError;
    function invariant$2(predicate, message) {
        var positionals = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            positionals[_i - 2] = arguments[_i];
        }
        if (!predicate) {
            throw new (InvariantError.bind.apply(InvariantError, __spreadArray([void 0, message], positionals)))();
        }
    }
    invariant$1.invariant = invariant$2;

    (function (exports) {
    var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
    }) : (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }));
    var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(invariant$1, exports);
    __exportStar(format$1, exports);
    }(lib$4));

    const LIBRARY_PREFIX = '[MSW]';
    /**
     * Formats a given message by appending the library's prefix string.
     */
    function formatMessage(message, ...positionals) {
        const interpolatedMessage = lib$4.format(message, ...positionals);
        return `${LIBRARY_PREFIX} ${interpolatedMessage}`;
    }
    /**
     * Prints a library-specific warning.
     */
    function warn(message, ...positionals) {
        console.warn(formatMessage(message, ...positionals));
    }
    /**
     * Prints a library-specific error.
     */
    function error(message, ...positionals) {
        console.error(formatMessage(message, ...positionals));
    }
    const devUtils = {
        formatMessage,
        warn,
        error,
    };

    class NetworkError extends Error {
        constructor(message) {
            super(message);
            this.name = 'NetworkError';
        }
    }

    function parseContentHeaders(headersString) {
        var _a, _b;
        const headers = lib$1$1.stringToHeaders(headersString);
        const contentType = headers.get('content-type') || 'text/plain';
        const disposition = headers.get('content-disposition');
        if (!disposition) {
            throw new Error('"Content-Disposition" header is required.');
        }
        const directives = disposition.split(';').reduce((acc, chunk) => {
            const [name, ...rest] = chunk.trim().split('=');
            acc[name] = rest.join('=');
            return acc;
        }, {});
        const name = (_a = directives.name) === null || _a === void 0 ? void 0 : _a.slice(1, -1);
        const filename = (_b = directives.filename) === null || _b === void 0 ? void 0 : _b.slice(1, -1);
        return {
            name,
            filename,
            contentType,
        };
    }
    /**
     * Parses a given string as a multipart/form-data.
     * Does not throw an exception on an invalid multipart string.
     */
    function parseMultipartData(data, headers) {
        const contentType = headers === null || headers === void 0 ? void 0 : headers.get('content-type');
        if (!contentType) {
            return undefined;
        }
        const [, ...directives] = contentType.split(/; */);
        const boundary = directives
            .filter((d) => d.startsWith('boundary='))
            .map((s) => s.replace(/^boundary=/, ''))[0];
        if (!boundary) {
            return undefined;
        }
        const boundaryRegExp = new RegExp(`--+${boundary}`);
        const fields = data
            .split(boundaryRegExp)
            .filter((chunk) => chunk.startsWith('\r\n') && chunk.endsWith('\r\n'))
            .map((chunk) => chunk.trimStart().replace(/\r\n$/, ''));
        if (!fields.length) {
            return undefined;
        }
        const parsedBody = {};
        try {
            for (const field of fields) {
                const [contentHeaders, ...rest] = field.split('\r\n\r\n');
                const contentBody = rest.join('\r\n\r\n');
                const { contentType, filename, name } = parseContentHeaders(contentHeaders);
                const value = filename === undefined
                    ? contentBody
                    : new File([contentBody], filename, { type: contentType });
                const parsedValue = parsedBody[name];
                if (parsedValue === undefined) {
                    parsedBody[name] = value;
                }
                else if (Array.isArray(parsedValue)) {
                    parsedBody[name] = [...parsedValue, value];
                }
                else {
                    parsedBody[name] = [parsedValue, value];
                }
            }
            return parsedBody;
        }
        catch (error) {
            return undefined;
        }
    }

    /**
     * Parses a given request/response body based on the `Content-Type` header.
     */
    function parseBody(body, headers) {
        // Return whatever falsey body value is given.
        if (!body) {
            return body;
        }
        const contentType = headers === null || headers === void 0 ? void 0 : headers.get('content-type');
        // If the body has a Multipart Content-Type
        // parse it into an object.
        const hasMultipartContent = contentType === null || contentType === void 0 ? void 0 : contentType.startsWith('multipart/form-data');
        if (hasMultipartContent && typeof body !== 'object') {
            return parseMultipartData(body, headers) || body;
        }
        // If the intercepted request's body has a JSON Content-Type
        // parse it into an object.
        const hasJsonContent = contentType === null || contentType === void 0 ? void 0 : contentType.includes('json');
        if (hasJsonContent && typeof body !== 'object') {
            return jsonParse(body) || body;
        }
        // Otherwise leave as-is.
        return body;
    }

    /**
     * Returns a relative URL if the given request URL is relative to the current origin.
     * Otherwise returns an absolute URL.
     */
    const getPublicUrlFromRequest = (request) => {
        return request.referrer.startsWith(request.url.origin)
            ? request.url.pathname
            : new URL(request.url.pathname, `${request.url.protocol}//${request.url.host}`).href;
    };

    var StatusCodeColor;
    (function (StatusCodeColor) {
        StatusCodeColor["Success"] = "#69AB32";
        StatusCodeColor["Warning"] = "#F0BB4B";
        StatusCodeColor["Danger"] = "#E95F5D";
    })(StatusCodeColor || (StatusCodeColor = {}));
    /**
     * Returns a HEX color for a given response status code number.
     */
    function getStatusCodeColor(status) {
        if (status < 300) {
            return StatusCodeColor.Success;
        }
        if (status < 400) {
            return StatusCodeColor.Warning;
        }
        return StatusCodeColor.Danger;
    }

    /**
     * Returns a timestamp string in a "HH:MM:SS" format.
     */
    function getTimestamp() {
        const now = new Date();
        return [now.getHours(), now.getMinutes(), now.getSeconds()]
            .map(String)
            .map((chunk) => chunk.slice(0, 2))
            .map((chunk) => chunk.padStart(2, '0'))
            .join(':');
    }

    /**
     * Formats a mocked request for introspection in browser's console.
     */
    function prepareRequest(request) {
        return Object.assign(Object.assign({}, request), { headers: request.headers.all() });
    }

    /**
     * Formats a mocked response for introspection in the browser's console.
     */
    function prepareResponse(res) {
        const responseHeaders = lib$1$1.objectToHeaders(res.headers);
        return Object.assign(Object.assign({}, res), { 
            // Parse a response JSON body for preview in the logs
            body: parseBody(res.body, responseHeaders) });
    }

    /**
     * Converts a string path to a Regular Expression.
     * Transforms path parameters into named RegExp groups.
     */
    const pathToRegExp = (path) => {
        const pattern = path
            // Escape literal dots
            .replace(/\./g, '\\.')
            // Escape literal slashes
            .replace(/\//g, '/')
            // Escape literal question marks
            .replace(/\?/g, '\\?')
            // Ignore trailing slashes
            .replace(/\/+$/, '')
            // Replace wildcard with any zero-to-any character sequence
            .replace(/\*+/g, '.*')
            // Replace parameters with named capturing groups
            .replace(/:([^\d|^\/][a-zA-Z0-9_]*(?=(?:\/|\\.)|$))/g, (_, paramName) => `(?<${paramName}>[^\/]+?)`)
            // Allow optional trailing slash
            .concat('(\\/|$)');
        return new RegExp(pattern, 'gi');
    };

    /**
     * Matches a given url against a path.
     */
    const match = (path, url) => {
        const expression = path instanceof RegExp ? path : pathToRegExp(path);
        const match = expression.exec(url) || false;
        // Matches in strict mode: match string should equal to input (url)
        // Otherwise loose matches will be considered truthy:
        // match('/messages/:id', '/messages/123/users') // true
        const matches = path instanceof RegExp ? !!match : !!match && match[0] === match.input;
        return {
            matches,
            params: match && matches ? match.groups || null : null,
        };
    };

    var getCleanUrl$1 = {};

    Object.defineProperty(getCleanUrl$1, "__esModule", { value: true });
    var getCleanUrl_2 = getCleanUrl$1.getCleanUrl = void 0;
    /**
     * Removes query parameters and hashes from a given URL.
     */
    function getCleanUrl(url, isAbsolute) {
        if (isAbsolute === void 0) { isAbsolute = true; }
        return [isAbsolute && url.origin, url.pathname].filter(Boolean).join('');
    }
    getCleanUrl_2 = getCleanUrl$1.getCleanUrl = getCleanUrl;

    const REDUNDANT_CHARACTERS_EXP = /[\?|#].*$/g;
    function getSearchParams(path) {
        return new URL(`/${path}`, 'http://localhost').searchParams;
    }
    /**
     * Removes query parameters and hashes from a given URL string.
     */
    function cleanUrl(path) {
        return path.replace(REDUNDANT_CHARACTERS_EXP, '');
    }

    /**
     * Returns an absolute URL based on the given path.
     */
    function getAbsoluteUrl(path, baseUrl) {
        // Ignore absolute URLs.
        if (!path.startsWith('/')) {
            return path;
        }
        // Resolve a relative request URL against a given custom "baseUrl"
        // or the current location (in the case of browser/browser-like environments).
        const origin = baseUrl || (typeof location !== 'undefined' && location.origin);
        return origin
            ? // Encode and decode the path to preserve escaped characters.
                decodeURI(new URL(encodeURI(path), origin).href)
            : path;
    }

    /**
     * Normalizes a given request handler path:
     * - Preserves RegExp.
     * - Removes query parameters and hashes.
     * - Rebases relative URLs against the "baseUrl" or the current location.
     * - Preserves relative URLs in Node.js, unless specified otherwise.
     */
    function normalizePath(path, baseUrl) {
        // RegExp paths do not need normalization.
        if (path instanceof RegExp) {
            return path;
        }
        const maybeAbsoluteUrl = getAbsoluteUrl(path, baseUrl);
        return cleanUrl(maybeAbsoluteUrl);
    }

    /**
     * Returns the result of matching given request URL against a mask.
     */
    function matchRequestUrl(url, path, baseUrl) {
        const normalizedPath = normalizePath(path, baseUrl);
        return match(normalizedPath, getCleanUrl_2(url));
    }

    /**
     * Composes a given list of functions into a new function that
     * executes from right to left.
     */
    function compose(...fns) {
        return (...args) => {
            return fns.reduceRight((leftFn, rightFn) => {
                return leftFn instanceof Promise
                    ? Promise.resolve(leftFn).then(rightFn)
                    : rightFn(leftFn);
            }, args[0]);
        };
    }

    const defaultResponse = {
        status: 200,
        statusText: 'OK',
        body: null,
        delay: 0,
        once: false,
    };
    const defaultResponseTransformers = [];
    function createResponseComposition(responseOverrides, defaultTransformers = defaultResponseTransformers) {
        return (...transformers) => __awaiter$3(this, void 0, void 0, function* () {
            const initialResponse = Object.assign({}, defaultResponse, {
                headers: new lib$1$1.Headers({
                    'x-powered-by': 'msw',
                }),
            }, responseOverrides);
            const resolvedTransformers = [
                ...defaultTransformers,
                ...transformers,
            ].filter(Boolean);
            const resolvedResponse = resolvedTransformers.length > 0
                ? compose(...resolvedTransformers)(initialResponse)
                : initialResponse;
            return resolvedResponse;
        });
    }
    const response = Object.assign(createResponseComposition(), {
        once: createResponseComposition({ once: true }),
        networkError(message) {
            throw new NetworkError(message);
        },
    });

    /**
     * Return the stack trace frame of a function's invocation.
     */
    function getCallFrame() {
        // In <IE11, new Error may return an undefined stack
        const stack = (new Error().stack || '');
        const frames = stack.split('\n');
        // Get the first frame that doesn't reference the library's internal trace.
        // Assume that frame is the invocation frame.
        const ignoreFrameRegExp = /(node_modules)?[\/\\]lib[\/\\](umd|esm|iief|cjs)[\/\\]|^[^\/\\]*$/;
        const declarationFrame = frames.slice(1).find((frame) => {
            return !ignoreFrameRegExp.test(frame);
        });
        if (!declarationFrame) {
            return;
        }
        // Extract file reference from the stack frame.
        const declarationPath = declarationFrame
            .replace(/\s*at [^()]*\(([^)]+)\)/, '$1')
            .replace(/^@/, '');
        return declarationPath;
    }

    /**
     * Determines if the given function is an iterator.
     */
    function isIterable(fn) {
        if (!fn) {
            return false;
        }
        return typeof fn[Symbol.iterator] == 'function';
    }

    const defaultContext = {
        status: status$3,
        set,
        delay,
        fetch: fetch$2,
    };
    class RequestHandler {
        constructor(options) {
            this.shouldSkip = false;
            this.ctx = options.ctx || defaultContext;
            this.resolver = options.resolver;
            const callFrame = getCallFrame();
            this.info = Object.assign(Object.assign({}, options.info), { callFrame });
        }
        /**
         * Parse the captured request to extract additional information from it.
         * Parsed result is then exposed to other methods of this request handler.
         */
        parse(_request, _resolutionContext) {
            return null;
        }
        /**
         * Test if this handler matches the given request.
         */
        test(request, resolutionContext) {
            return this.predicate(request, this.parse(request, resolutionContext), resolutionContext);
        }
        /**
         * Derive the publicly exposed request (`req`) instance of the response resolver
         * from the captured request and its parsed result.
         */
        getPublicRequest(request, _parsedResult) {
            return request;
        }
        markAsSkipped(shouldSkip = true) {
            this.shouldSkip = shouldSkip;
        }
        /**
         * Execute this request handler and produce a mocked response
         * using the given resolver function.
         */
        run(request, resolutionContext) {
            return __awaiter$3(this, void 0, void 0, function* () {
                if (this.shouldSkip) {
                    return null;
                }
                const parsedResult = this.parse(request, resolutionContext);
                const shouldIntercept = this.predicate(request, parsedResult, resolutionContext);
                if (!shouldIntercept) {
                    return null;
                }
                const publicRequest = this.getPublicRequest(request, parsedResult);
                // Create a response extraction wrapper around the resolver
                // since it can be both an async function and a generator.
                const executeResolver = this.wrapResolver(this.resolver);
                const mockedResponse = yield executeResolver(publicRequest, response, this.ctx);
                return this.createExecutionResult(parsedResult, publicRequest, mockedResponse);
            });
        }
        wrapResolver(resolver) {
            return (req, res, ctx) => __awaiter$3(this, void 0, void 0, function* () {
                const result = this.resolverGenerator || (yield resolver(req, res, ctx));
                if (isIterable(result)) {
                    const { value, done } = result[Symbol.iterator]().next();
                    const nextResponse = yield value;
                    // If the generator is done and there is no next value,
                    // return the previous generator's value.
                    if (!nextResponse && done) {
                        return this.resolverGeneratorResult;
                    }
                    if (!this.resolverGenerator) {
                        this.resolverGenerator = result;
                    }
                    this.resolverGeneratorResult = nextResponse;
                    return nextResponse;
                }
                return result;
            });
        }
        createExecutionResult(parsedResult, request, response) {
            return {
                handler: this,
                parsedResult: parsedResult || null,
                request,
                response: response || null,
            };
        }
    }

    /**
     * Performs a case-insensitive comparison of two given strings.
     */
    function isStringEqual(actual, expected) {
        return actual.toLowerCase() === expected.toLowerCase();
    }

    var RESTMethods;
    (function (RESTMethods) {
        RESTMethods["HEAD"] = "HEAD";
        RESTMethods["GET"] = "GET";
        RESTMethods["POST"] = "POST";
        RESTMethods["PUT"] = "PUT";
        RESTMethods["PATCH"] = "PATCH";
        RESTMethods["OPTIONS"] = "OPTIONS";
        RESTMethods["DELETE"] = "DELETE";
    })(RESTMethods || (RESTMethods = {}));
    const restContext = {
        set,
        status: status$3,
        cookie,
        body,
        text,
        json,
        xml,
        delay,
        fetch: fetch$2,
    };
    /**
     * Request handler for REST API requests.
     * Provides request matching based on method and URL.
     */
    class RestHandler extends RequestHandler {
        constructor(method, path, resolver) {
            super({
                info: {
                    header: `${method} ${path}`,
                    path,
                    method,
                },
                ctx: restContext,
                resolver,
            });
            this.checkRedundantQueryParameters();
        }
        checkRedundantQueryParameters() {
            const { method, path } = this.info;
            if (path instanceof RegExp) {
                return;
            }
            const url = cleanUrl(path);
            // Bypass request handler URLs that have no redundant characters.
            if (url === path) {
                return;
            }
            const searchParams = getSearchParams(path);
            const queryParams = [];
            searchParams.forEach((_, paramName) => {
                queryParams.push(paramName);
            });
            devUtils.warn(`\
Found a redundant usage of query parameters in the request handler URL for "${method} ${path}". Please match against a path instead, and access query parameters in the response resolver function:

rest.${method.toLowerCase()}("${url}", (req, res, ctx) => {
  const query = req.url.searchParams
${queryParams
            .map((paramName) => `\
  const ${paramName} = query.get("${paramName}")`)
            .join('\n')}
})\
      `);
        }
        parse(request, resolutionContext) {
            return matchRequestUrl(request.url, this.info.path, resolutionContext === null || resolutionContext === void 0 ? void 0 : resolutionContext.baseUrl);
        }
        getPublicRequest(request, parsedResult) {
            return Object.assign(Object.assign({}, request), { params: parsedResult.params || {} });
        }
        predicate(request, parsedResult) {
            return (isStringEqual(this.info.method, request.method) && parsedResult.matches);
        }
        log(request, response) {
            const publicUrl = getPublicUrlFromRequest(request);
            const loggedRequest = prepareRequest(request);
            const loggedResponse = prepareResponse(response);
            const statusColor = getStatusCodeColor(response.status);
            console.groupCollapsed(devUtils.formatMessage('%s %s %s (%c%s%c)'), getTimestamp(), request.method, publicUrl, `color:${statusColor}`, `${response.status} ${response.statusText}`, 'color:inherit');
            console.log('Request', loggedRequest);
            console.log('Handler:', {
                mask: this.info.path,
                resolver: this.resolver,
            });
            console.log('Response', loggedResponse);
            console.groupEnd();
        }
    }

    function createRestHandler(method) {
        return (path, resolver) => {
            return new RestHandler(method, path, resolver);
        };
    }
    const rest = {
        head: createRestHandler(RESTMethods.HEAD),
        get: createRestHandler(RESTMethods.GET),
        post: createRestHandler(RESTMethods.POST),
        put: createRestHandler(RESTMethods.PUT),
        delete: createRestHandler(RESTMethods.DELETE),
        patch: createRestHandler(RESTMethods.PATCH),
        options: createRestHandler(RESTMethods.OPTIONS),
    };

    function _typeof$3(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$3 = function _typeof(obj) { return typeof obj; }; } else { _typeof$3 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$3(obj); }

    /**
     * Return true if `value` is object-like. A value is object-like if it's not
     * `null` and has a `typeof` result of "object".
     */
    function isObjectLike(value) {
      return _typeof$3(value) == 'object' && value !== null;
    }

    // In ES2015 (or a polyfilled) environment, this will be Symbol.iterator

    var SYMBOL_TO_STRING_TAG = typeof Symbol === 'function' && Symbol.toStringTag != null ? Symbol.toStringTag : '@@toStringTag';

    /**
     * Represents a location in a Source.
     */

    /**
     * Takes a Source and a UTF-8 character offset, and returns the corresponding
     * line and column as a SourceLocation.
     */
    function getLocation(source, position) {
      var lineRegexp = /\r\n|[\n\r]/g;
      var line = 1;
      var column = position + 1;
      var match;

      while ((match = lineRegexp.exec(source.body)) && match.index < position) {
        line += 1;
        column = position + 1 - (match.index + match[0].length);
      }

      return {
        line: line,
        column: column
      };
    }

    /**
     * Render a helpful description of the location in the GraphQL Source document.
     */

    function printLocation(location) {
      return printSourceLocation(location.source, getLocation(location.source, location.start));
    }
    /**
     * Render a helpful description of the location in the GraphQL Source document.
     */

    function printSourceLocation(source, sourceLocation) {
      var firstLineColumnOffset = source.locationOffset.column - 1;
      var body = whitespace(firstLineColumnOffset) + source.body;
      var lineIndex = sourceLocation.line - 1;
      var lineOffset = source.locationOffset.line - 1;
      var lineNum = sourceLocation.line + lineOffset;
      var columnOffset = sourceLocation.line === 1 ? firstLineColumnOffset : 0;
      var columnNum = sourceLocation.column + columnOffset;
      var locationStr = "".concat(source.name, ":").concat(lineNum, ":").concat(columnNum, "\n");
      var lines = body.split(/\r\n|[\n\r]/g);
      var locationLine = lines[lineIndex]; // Special case for minified documents

      if (locationLine.length > 120) {
        var subLineIndex = Math.floor(columnNum / 80);
        var subLineColumnNum = columnNum % 80;
        var subLines = [];

        for (var i = 0; i < locationLine.length; i += 80) {
          subLines.push(locationLine.slice(i, i + 80));
        }

        return locationStr + printPrefixedLines([["".concat(lineNum), subLines[0]]].concat(subLines.slice(1, subLineIndex + 1).map(function (subLine) {
          return ['', subLine];
        }), [[' ', whitespace(subLineColumnNum - 1) + '^'], ['', subLines[subLineIndex + 1]]]));
      }

      return locationStr + printPrefixedLines([// Lines specified like this: ["prefix", "string"],
      ["".concat(lineNum - 1), lines[lineIndex - 1]], ["".concat(lineNum), locationLine], ['', whitespace(columnNum - 1) + '^'], ["".concat(lineNum + 1), lines[lineIndex + 1]]]);
    }

    function printPrefixedLines(lines) {
      var existingLines = lines.filter(function (_ref) {
        _ref[0];
            var line = _ref[1];
        return line !== undefined;
      });
      var padLen = Math.max.apply(Math, existingLines.map(function (_ref2) {
        var prefix = _ref2[0];
        return prefix.length;
      }));
      return existingLines.map(function (_ref3) {
        var prefix = _ref3[0],
            line = _ref3[1];
        return leftPad(padLen, prefix) + (line ? ' | ' + line : ' |');
      }).join('\n');
    }

    function whitespace(len) {
      return Array(len + 1).join(' ');
    }

    function leftPad(len, str) {
      return whitespace(len - str.length) + str;
    }

    function _typeof$2(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$2 = function _typeof(obj) { return typeof obj; }; } else { _typeof$2 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$2(obj); }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties$1(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass$1(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$1(Constructor.prototype, protoProps); if (staticProps) _defineProperties$1(Constructor, staticProps); return Constructor; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

    function _possibleConstructorReturn(self, call) { if (call && (_typeof$2(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

    function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

    function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

    function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    /**
     * A GraphQLError describes an Error found during the parse, validate, or
     * execute phases of performing a GraphQL operation. In addition to a message
     * and stack trace, it also includes information about the locations in a
     * GraphQL document and/or execution result that correspond to the Error.
     */

    var GraphQLError = /*#__PURE__*/function (_Error) {
      _inherits(GraphQLError, _Error);

      var _super = _createSuper(GraphQLError);

      /**
       * A message describing the Error for debugging purposes.
       *
       * Enumerable, and appears in the result of JSON.stringify().
       *
       * Note: should be treated as readonly, despite invariant usage.
       */

      /**
       * An array of { line, column } locations within the source GraphQL document
       * which correspond to this error.
       *
       * Errors during validation often contain multiple locations, for example to
       * point out two things with the same name. Errors during execution include a
       * single location, the field which produced the error.
       *
       * Enumerable, and appears in the result of JSON.stringify().
       */

      /**
       * An array describing the JSON-path into the execution response which
       * corresponds to this error. Only included for errors during execution.
       *
       * Enumerable, and appears in the result of JSON.stringify().
       */

      /**
       * An array of GraphQL AST Nodes corresponding to this error.
       */

      /**
       * The source GraphQL document for the first location of this error.
       *
       * Note that if this Error represents more than one node, the source may not
       * represent nodes after the first node.
       */

      /**
       * An array of character offsets within the source GraphQL document
       * which correspond to this error.
       */

      /**
       * The original error thrown from a field resolver during execution.
       */

      /**
       * Extension fields to add to the formatted error.
       */
      function GraphQLError(message, nodes, source, positions, path, originalError, extensions) {
        var _locations2, _source2, _positions2, _extensions2;

        var _this;

        _classCallCheck(this, GraphQLError);

        _this = _super.call(this, message); // Compute list of blame nodes.

        var _nodes = Array.isArray(nodes) ? nodes.length !== 0 ? nodes : undefined : nodes ? [nodes] : undefined; // Compute locations in the source for the given nodes/positions.


        var _source = source;

        if (!_source && _nodes) {
          var _nodes$0$loc;

          _source = (_nodes$0$loc = _nodes[0].loc) === null || _nodes$0$loc === void 0 ? void 0 : _nodes$0$loc.source;
        }

        var _positions = positions;

        if (!_positions && _nodes) {
          _positions = _nodes.reduce(function (list, node) {
            if (node.loc) {
              list.push(node.loc.start);
            }

            return list;
          }, []);
        }

        if (_positions && _positions.length === 0) {
          _positions = undefined;
        }

        var _locations;

        if (positions && source) {
          _locations = positions.map(function (pos) {
            return getLocation(source, pos);
          });
        } else if (_nodes) {
          _locations = _nodes.reduce(function (list, node) {
            if (node.loc) {
              list.push(getLocation(node.loc.source, node.loc.start));
            }

            return list;
          }, []);
        }

        var _extensions = extensions;

        if (_extensions == null && originalError != null) {
          var originalExtensions = originalError.extensions;

          if (isObjectLike(originalExtensions)) {
            _extensions = originalExtensions;
          }
        }

        Object.defineProperties(_assertThisInitialized(_this), {
          name: {
            value: 'GraphQLError'
          },
          message: {
            value: message,
            // By being enumerable, JSON.stringify will include `message` in the
            // resulting output. This ensures that the simplest possible GraphQL
            // service adheres to the spec.
            enumerable: true,
            writable: true
          },
          locations: {
            // Coercing falsy values to undefined ensures they will not be included
            // in JSON.stringify() when not provided.
            value: (_locations2 = _locations) !== null && _locations2 !== void 0 ? _locations2 : undefined,
            // By being enumerable, JSON.stringify will include `locations` in the
            // resulting output. This ensures that the simplest possible GraphQL
            // service adheres to the spec.
            enumerable: _locations != null
          },
          path: {
            // Coercing falsy values to undefined ensures they will not be included
            // in JSON.stringify() when not provided.
            value: path !== null && path !== void 0 ? path : undefined,
            // By being enumerable, JSON.stringify will include `path` in the
            // resulting output. This ensures that the simplest possible GraphQL
            // service adheres to the spec.
            enumerable: path != null
          },
          nodes: {
            value: _nodes !== null && _nodes !== void 0 ? _nodes : undefined
          },
          source: {
            value: (_source2 = _source) !== null && _source2 !== void 0 ? _source2 : undefined
          },
          positions: {
            value: (_positions2 = _positions) !== null && _positions2 !== void 0 ? _positions2 : undefined
          },
          originalError: {
            value: originalError
          },
          extensions: {
            // Coercing falsy values to undefined ensures they will not be included
            // in JSON.stringify() when not provided.
            value: (_extensions2 = _extensions) !== null && _extensions2 !== void 0 ? _extensions2 : undefined,
            // By being enumerable, JSON.stringify will include `path` in the
            // resulting output. This ensures that the simplest possible GraphQL
            // service adheres to the spec.
            enumerable: _extensions != null
          }
        }); // Include (non-enumerable) stack trace.

        if (originalError !== null && originalError !== void 0 && originalError.stack) {
          Object.defineProperty(_assertThisInitialized(_this), 'stack', {
            value: originalError.stack,
            writable: true,
            configurable: true
          });
          return _possibleConstructorReturn(_this);
        } // istanbul ignore next (See: 'https://github.com/graphql/graphql-js/issues/2317')


        if (Error.captureStackTrace) {
          Error.captureStackTrace(_assertThisInitialized(_this), GraphQLError);
        } else {
          Object.defineProperty(_assertThisInitialized(_this), 'stack', {
            value: Error().stack,
            writable: true,
            configurable: true
          });
        }

        return _this;
      }

      _createClass$1(GraphQLError, [{
        key: "toString",
        value: function toString() {
          return printError(this);
        } // FIXME: workaround to not break chai comparisons, should be remove in v16
        // $FlowFixMe[unsupported-syntax] Flow doesn't support computed properties yet

      }, {
        key: SYMBOL_TO_STRING_TAG,
        get: function get() {
          return 'Object';
        }
      }]);

      return GraphQLError;
    }( /*#__PURE__*/_wrapNativeSuper(Error));
    /**
     * Prints a GraphQLError to a string, representing useful location information
     * about the error's position in the source.
     */

    function printError(error) {
      var output = error.message;

      if (error.nodes) {
        for (var _i2 = 0, _error$nodes2 = error.nodes; _i2 < _error$nodes2.length; _i2++) {
          var node = _error$nodes2[_i2];

          if (node.loc) {
            output += '\n\n' + printLocation(node.loc);
          }
        }
      } else if (error.source && error.locations) {
        for (var _i4 = 0, _error$locations2 = error.locations; _i4 < _error$locations2.length; _i4++) {
          var location = _error$locations2[_i4];
          output += '\n\n' + printSourceLocation(error.source, location);
        }
      }

      return output;
    }

    /**
     * Produces a GraphQLError representing a syntax error, containing useful
     * descriptive information about the syntax error's position in the source.
     */

    function syntaxError(source, position, description) {
      return new GraphQLError("Syntax Error: ".concat(description), undefined, source, [position]);
    }

    /**
     * The set of allowed kind values for AST nodes.
     */
    var Kind = Object.freeze({
      // Name
      NAME: 'Name',
      // Document
      DOCUMENT: 'Document',
      OPERATION_DEFINITION: 'OperationDefinition',
      VARIABLE_DEFINITION: 'VariableDefinition',
      SELECTION_SET: 'SelectionSet',
      FIELD: 'Field',
      ARGUMENT: 'Argument',
      // Fragments
      FRAGMENT_SPREAD: 'FragmentSpread',
      INLINE_FRAGMENT: 'InlineFragment',
      FRAGMENT_DEFINITION: 'FragmentDefinition',
      // Values
      VARIABLE: 'Variable',
      INT: 'IntValue',
      FLOAT: 'FloatValue',
      STRING: 'StringValue',
      BOOLEAN: 'BooleanValue',
      NULL: 'NullValue',
      ENUM: 'EnumValue',
      LIST: 'ListValue',
      OBJECT: 'ObjectValue',
      OBJECT_FIELD: 'ObjectField',
      // Directives
      DIRECTIVE: 'Directive',
      // Types
      NAMED_TYPE: 'NamedType',
      LIST_TYPE: 'ListType',
      NON_NULL_TYPE: 'NonNullType',
      // Type System Definitions
      SCHEMA_DEFINITION: 'SchemaDefinition',
      OPERATION_TYPE_DEFINITION: 'OperationTypeDefinition',
      // Type Definitions
      SCALAR_TYPE_DEFINITION: 'ScalarTypeDefinition',
      OBJECT_TYPE_DEFINITION: 'ObjectTypeDefinition',
      FIELD_DEFINITION: 'FieldDefinition',
      INPUT_VALUE_DEFINITION: 'InputValueDefinition',
      INTERFACE_TYPE_DEFINITION: 'InterfaceTypeDefinition',
      UNION_TYPE_DEFINITION: 'UnionTypeDefinition',
      ENUM_TYPE_DEFINITION: 'EnumTypeDefinition',
      ENUM_VALUE_DEFINITION: 'EnumValueDefinition',
      INPUT_OBJECT_TYPE_DEFINITION: 'InputObjectTypeDefinition',
      // Directive Definitions
      DIRECTIVE_DEFINITION: 'DirectiveDefinition',
      // Type System Extensions
      SCHEMA_EXTENSION: 'SchemaExtension',
      // Type Extensions
      SCALAR_TYPE_EXTENSION: 'ScalarTypeExtension',
      OBJECT_TYPE_EXTENSION: 'ObjectTypeExtension',
      INTERFACE_TYPE_EXTENSION: 'InterfaceTypeExtension',
      UNION_TYPE_EXTENSION: 'UnionTypeExtension',
      ENUM_TYPE_EXTENSION: 'EnumTypeExtension',
      INPUT_OBJECT_TYPE_EXTENSION: 'InputObjectTypeExtension'
    });
    /**
     * The enum type representing the possible kind values of AST nodes.
     */

    function invariant(condition, message) {
      var booleanCondition = Boolean(condition); // istanbul ignore else (See transformation done in './resources/inlineInvariant.js')

      if (!booleanCondition) {
        throw new Error(message != null ? message : 'Unexpected invariant triggered.');
      }
    }

    // istanbul ignore next (See: 'https://github.com/graphql/graphql-js/issues/2317')
    var nodejsCustomInspectSymbol = typeof Symbol === 'function' && typeof Symbol.for === 'function' ? Symbol.for('nodejs.util.inspect.custom') : undefined;

    /**
     * The `defineInspect()` function defines `inspect()` prototype method as alias of `toJSON`
     */

    function defineInspect(classObject) {
      var fn = classObject.prototype.toJSON;
      typeof fn === 'function' || invariant(0);
      classObject.prototype.inspect = fn; // istanbul ignore else (See: 'https://github.com/graphql/graphql-js/issues/2317')

      if (nodejsCustomInspectSymbol) {
        classObject.prototype[nodejsCustomInspectSymbol] = fn;
      }
    }

    /**
     * Contains a range of UTF-8 character offsets and token references that
     * identify the region of the source from which the AST derived.
     */
    var Location = /*#__PURE__*/function () {
      /**
       * The character offset at which this Node begins.
       */

      /**
       * The character offset at which this Node ends.
       */

      /**
       * The Token at which this Node begins.
       */

      /**
       * The Token at which this Node ends.
       */

      /**
       * The Source document the AST represents.
       */
      function Location(startToken, endToken, source) {
        this.start = startToken.start;
        this.end = endToken.end;
        this.startToken = startToken;
        this.endToken = endToken;
        this.source = source;
      }

      var _proto = Location.prototype;

      _proto.toJSON = function toJSON() {
        return {
          start: this.start,
          end: this.end
        };
      };

      return Location;
    }(); // Print a simplified form when appearing in `inspect` and `util.inspect`.

    defineInspect(Location);
    /**
     * Represents a range of characters represented by a lexical token
     * within a Source.
     */

    var Token = /*#__PURE__*/function () {
      /**
       * The kind of Token.
       */

      /**
       * The character offset at which this Node begins.
       */

      /**
       * The character offset at which this Node ends.
       */

      /**
       * The 1-indexed line number on which this Token appears.
       */

      /**
       * The 1-indexed column number at which this Token begins.
       */

      /**
       * For non-punctuation tokens, represents the interpreted value of the token.
       */

      /**
       * Tokens exist as nodes in a double-linked-list amongst all tokens
       * including ignored tokens. <SOF> is always the first node and <EOF>
       * the last.
       */
      function Token(kind, start, end, line, column, prev, value) {
        this.kind = kind;
        this.start = start;
        this.end = end;
        this.line = line;
        this.column = column;
        this.value = value;
        this.prev = prev;
        this.next = null;
      }

      var _proto2 = Token.prototype;

      _proto2.toJSON = function toJSON() {
        return {
          kind: this.kind,
          value: this.value,
          line: this.line,
          column: this.column
        };
      };

      return Token;
    }(); // Print a simplified form when appearing in `inspect` and `util.inspect`.

    defineInspect(Token);
    /**
     * The list of all possible AST node types.
     */

    /**
     * An exported enum describing the different kinds of tokens that the
     * lexer emits.
     */
    var TokenKind = Object.freeze({
      SOF: '<SOF>',
      EOF: '<EOF>',
      BANG: '!',
      DOLLAR: '$',
      AMP: '&',
      PAREN_L: '(',
      PAREN_R: ')',
      SPREAD: '...',
      COLON: ':',
      EQUALS: '=',
      AT: '@',
      BRACKET_L: '[',
      BRACKET_R: ']',
      BRACE_L: '{',
      PIPE: '|',
      BRACE_R: '}',
      NAME: 'Name',
      INT: 'Int',
      FLOAT: 'Float',
      STRING: 'String',
      BLOCK_STRING: 'BlockString',
      COMMENT: 'Comment'
    });
    /**
     * The enum type representing the token kinds values.
     */

    function _typeof$1(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$1 = function _typeof(obj) { return typeof obj; }; } else { _typeof$1 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$1(obj); }
    var MAX_ARRAY_LENGTH = 10;
    var MAX_RECURSIVE_DEPTH = 2;
    /**
     * Used to print values in error messages.
     */

    function inspect(value) {
      return formatValue(value, []);
    }

    function formatValue(value, seenValues) {
      switch (_typeof$1(value)) {
        case 'string':
          return JSON.stringify(value);

        case 'function':
          return value.name ? "[function ".concat(value.name, "]") : '[function]';

        case 'object':
          if (value === null) {
            return 'null';
          }

          return formatObjectValue(value, seenValues);

        default:
          return String(value);
      }
    }

    function formatObjectValue(value, previouslySeenValues) {
      if (previouslySeenValues.indexOf(value) !== -1) {
        return '[Circular]';
      }

      var seenValues = [].concat(previouslySeenValues, [value]);
      var customInspectFn = getCustomFn(value);

      if (customInspectFn !== undefined) {
        var customValue = customInspectFn.call(value); // check for infinite recursion

        if (customValue !== value) {
          return typeof customValue === 'string' ? customValue : formatValue(customValue, seenValues);
        }
      } else if (Array.isArray(value)) {
        return formatArray(value, seenValues);
      }

      return formatObject(value, seenValues);
    }

    function formatObject(object, seenValues) {
      var keys = Object.keys(object);

      if (keys.length === 0) {
        return '{}';
      }

      if (seenValues.length > MAX_RECURSIVE_DEPTH) {
        return '[' + getObjectTag(object) + ']';
      }

      var properties = keys.map(function (key) {
        var value = formatValue(object[key], seenValues);
        return key + ': ' + value;
      });
      return '{ ' + properties.join(', ') + ' }';
    }

    function formatArray(array, seenValues) {
      if (array.length === 0) {
        return '[]';
      }

      if (seenValues.length > MAX_RECURSIVE_DEPTH) {
        return '[Array]';
      }

      var len = Math.min(MAX_ARRAY_LENGTH, array.length);
      var remaining = array.length - len;
      var items = [];

      for (var i = 0; i < len; ++i) {
        items.push(formatValue(array[i], seenValues));
      }

      if (remaining === 1) {
        items.push('... 1 more item');
      } else if (remaining > 1) {
        items.push("... ".concat(remaining, " more items"));
      }

      return '[' + items.join(', ') + ']';
    }

    function getCustomFn(object) {
      var customInspectFn = object[String(nodejsCustomInspectSymbol)];

      if (typeof customInspectFn === 'function') {
        return customInspectFn;
      }

      if (typeof object.inspect === 'function') {
        return object.inspect;
      }
    }

    function getObjectTag(object) {
      var tag = Object.prototype.toString.call(object).replace(/^\[object /, '').replace(/]$/, '');

      if (tag === 'Object' && typeof object.constructor === 'function') {
        var name = object.constructor.name;

        if (typeof name === 'string' && name !== '') {
          return name;
        }
      }

      return tag;
    }

    function devAssert(condition, message) {
      var booleanCondition = Boolean(condition); // istanbul ignore else (See transformation done in './resources/inlineInvariant.js')

      if (!booleanCondition) {
        throw new Error(message);
      }
    }

    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }
    /**
     * A replacement for instanceof which includes an error warning when multi-realm
     * constructors are detected.
     */

    // See: https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production
    // See: https://webpack.js.org/guides/production/
    var instanceOf = // eslint-disable-next-line no-shadow
    function instanceOf(value, constructor) {
      if (value instanceof constructor) {
        return true;
      }

      if (_typeof(value) === 'object' && value !== null) {
        var _value$constructor;

        var className = constructor.prototype[Symbol.toStringTag];
        var valueClassName = // We still need to support constructor's name to detect conflicts with older versions of this library.
        Symbol.toStringTag in value ? value[Symbol.toStringTag] : (_value$constructor = value.constructor) === null || _value$constructor === void 0 ? void 0 : _value$constructor.name;

        if (className === valueClassName) {
          var stringifiedValue = inspect(value);
          throw new Error("Cannot use ".concat(className, " \"").concat(stringifiedValue, "\" from another module or realm.\n\nEnsure that there is only one instance of \"graphql\" in the node_modules\ndirectory. If different versions of \"graphql\" are the dependencies of other\nrelied on modules, use \"resolutions\" to ensure only one version is installed.\n\nhttps://yarnpkg.com/en/docs/selective-version-resolutions\n\nDuplicate \"graphql\" modules cannot be used at the same time since different\nversions may have different capabilities and behavior. The data from one\nversion used in the function from another could produce confusing and\nspurious results."));
        }
      }

      return false;
    };

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    /**
     * A representation of source input to GraphQL. The `name` and `locationOffset` parameters are
     * optional, but they are useful for clients who store GraphQL documents in source files.
     * For example, if the GraphQL input starts at line 40 in a file named `Foo.graphql`, it might
     * be useful for `name` to be `"Foo.graphql"` and location to be `{ line: 40, column: 1 }`.
     * The `line` and `column` properties in `locationOffset` are 1-indexed.
     */
    var Source = /*#__PURE__*/function () {
      function Source(body) {
        var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'GraphQL request';
        var locationOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
          line: 1,
          column: 1
        };
        typeof body === 'string' || devAssert(0, "Body must be a string. Received: ".concat(inspect(body), "."));
        this.body = body;
        this.name = name;
        this.locationOffset = locationOffset;
        this.locationOffset.line > 0 || devAssert(0, 'line in locationOffset is 1-indexed and must be positive.');
        this.locationOffset.column > 0 || devAssert(0, 'column in locationOffset is 1-indexed and must be positive.');
      } // $FlowFixMe[unsupported-syntax] Flow doesn't support computed properties yet


      _createClass(Source, [{
        key: SYMBOL_TO_STRING_TAG,
        get: function get() {
          return 'Source';
        }
      }]);

      return Source;
    }();
    /**
     * Test if the given value is a Source object.
     *
     * @internal
     */

    // eslint-disable-next-line no-redeclare
    function isSource(source) {
      return instanceOf(source, Source);
    }

    /**
     * The set of allowed directive location values.
     */
    var DirectiveLocation = Object.freeze({
      // Request Definitions
      QUERY: 'QUERY',
      MUTATION: 'MUTATION',
      SUBSCRIPTION: 'SUBSCRIPTION',
      FIELD: 'FIELD',
      FRAGMENT_DEFINITION: 'FRAGMENT_DEFINITION',
      FRAGMENT_SPREAD: 'FRAGMENT_SPREAD',
      INLINE_FRAGMENT: 'INLINE_FRAGMENT',
      VARIABLE_DEFINITION: 'VARIABLE_DEFINITION',
      // Type System Definitions
      SCHEMA: 'SCHEMA',
      SCALAR: 'SCALAR',
      OBJECT: 'OBJECT',
      FIELD_DEFINITION: 'FIELD_DEFINITION',
      ARGUMENT_DEFINITION: 'ARGUMENT_DEFINITION',
      INTERFACE: 'INTERFACE',
      UNION: 'UNION',
      ENUM: 'ENUM',
      ENUM_VALUE: 'ENUM_VALUE',
      INPUT_OBJECT: 'INPUT_OBJECT',
      INPUT_FIELD_DEFINITION: 'INPUT_FIELD_DEFINITION'
    });
    /**
     * The enum type representing the directive location values.
     */

    /**
     * Produces the value of a block string from its parsed raw value, similar to
     * CoffeeScript's block string, Python's docstring trim or Ruby's strip_heredoc.
     *
     * This implements the GraphQL spec's BlockStringValue() static algorithm.
     *
     * @internal
     */
    function dedentBlockStringValue(rawString) {
      // Expand a block string's raw value into independent lines.
      var lines = rawString.split(/\r\n|[\n\r]/g); // Remove common indentation from all lines but first.

      var commonIndent = getBlockStringIndentation(rawString);

      if (commonIndent !== 0) {
        for (var i = 1; i < lines.length; i++) {
          lines[i] = lines[i].slice(commonIndent);
        }
      } // Remove leading and trailing blank lines.


      var startLine = 0;

      while (startLine < lines.length && isBlank(lines[startLine])) {
        ++startLine;
      }

      var endLine = lines.length;

      while (endLine > startLine && isBlank(lines[endLine - 1])) {
        --endLine;
      } // Return a string of the lines joined with U+000A.


      return lines.slice(startLine, endLine).join('\n');
    }

    function isBlank(str) {
      for (var i = 0; i < str.length; ++i) {
        if (str[i] !== ' ' && str[i] !== '\t') {
          return false;
        }
      }

      return true;
    }
    /**
     * @internal
     */


    function getBlockStringIndentation(value) {
      var _commonIndent;

      var isFirstLine = true;
      var isEmptyLine = true;
      var indent = 0;
      var commonIndent = null;

      for (var i = 0; i < value.length; ++i) {
        switch (value.charCodeAt(i)) {
          case 13:
            //  \r
            if (value.charCodeAt(i + 1) === 10) {
              ++i; // skip \r\n as one symbol
            }

          // falls through

          case 10:
            //  \n
            isFirstLine = false;
            isEmptyLine = true;
            indent = 0;
            break;

          case 9: //   \t

          case 32:
            //  <space>
            ++indent;
            break;

          default:
            if (isEmptyLine && !isFirstLine && (commonIndent === null || indent < commonIndent)) {
              commonIndent = indent;
            }

            isEmptyLine = false;
        }
      }

      return (_commonIndent = commonIndent) !== null && _commonIndent !== void 0 ? _commonIndent : 0;
    }

    /**
     * Given a Source object, creates a Lexer for that source.
     * A Lexer is a stateful stream generator in that every time
     * it is advanced, it returns the next token in the Source. Assuming the
     * source lexes, the final Token emitted by the lexer will be of kind
     * EOF, after which the lexer will repeatedly return the same EOF token
     * whenever called.
     */

    var Lexer = /*#__PURE__*/function () {
      /**
       * The previously focused non-ignored token.
       */

      /**
       * The currently focused non-ignored token.
       */

      /**
       * The (1-indexed) line containing the current token.
       */

      /**
       * The character offset at which the current line begins.
       */
      function Lexer(source) {
        var startOfFileToken = new Token(TokenKind.SOF, 0, 0, 0, 0, null);
        this.source = source;
        this.lastToken = startOfFileToken;
        this.token = startOfFileToken;
        this.line = 1;
        this.lineStart = 0;
      }
      /**
       * Advances the token stream to the next non-ignored token.
       */


      var _proto = Lexer.prototype;

      _proto.advance = function advance() {
        this.lastToken = this.token;
        var token = this.token = this.lookahead();
        return token;
      }
      /**
       * Looks ahead and returns the next non-ignored token, but does not change
       * the state of Lexer.
       */
      ;

      _proto.lookahead = function lookahead() {
        var token = this.token;

        if (token.kind !== TokenKind.EOF) {
          do {
            var _token$next;

            // Note: next is only mutable during parsing, so we cast to allow this.
            token = (_token$next = token.next) !== null && _token$next !== void 0 ? _token$next : token.next = readToken(this, token);
          } while (token.kind === TokenKind.COMMENT);
        }

        return token;
      };

      return Lexer;
    }();
    /**
     * @internal
     */

    function isPunctuatorTokenKind(kind) {
      return kind === TokenKind.BANG || kind === TokenKind.DOLLAR || kind === TokenKind.AMP || kind === TokenKind.PAREN_L || kind === TokenKind.PAREN_R || kind === TokenKind.SPREAD || kind === TokenKind.COLON || kind === TokenKind.EQUALS || kind === TokenKind.AT || kind === TokenKind.BRACKET_L || kind === TokenKind.BRACKET_R || kind === TokenKind.BRACE_L || kind === TokenKind.PIPE || kind === TokenKind.BRACE_R;
    }

    function printCharCode(code) {
      return (// NaN/undefined represents access beyond the end of the file.
        isNaN(code) ? TokenKind.EOF : // Trust JSON for ASCII.
        code < 0x007f ? JSON.stringify(String.fromCharCode(code)) : // Otherwise print the escaped form.
        "\"\\u".concat(('00' + code.toString(16).toUpperCase()).slice(-4), "\"")
      );
    }
    /**
     * Gets the next token from the source starting at the given position.
     *
     * This skips over whitespace until it finds the next lexable token, then lexes
     * punctuators immediately or calls the appropriate helper function for more
     * complicated tokens.
     */


    function readToken(lexer, prev) {
      var source = lexer.source;
      var body = source.body;
      var bodyLength = body.length;
      var pos = prev.end;

      while (pos < bodyLength) {
        var code = body.charCodeAt(pos);
        var _line = lexer.line;

        var _col = 1 + pos - lexer.lineStart; // SourceCharacter


        switch (code) {
          case 0xfeff: // <BOM>

          case 9: //   \t

          case 32: //  <space>

          case 44:
            //  ,
            ++pos;
            continue;

          case 10:
            //  \n
            ++pos;
            ++lexer.line;
            lexer.lineStart = pos;
            continue;

          case 13:
            //  \r
            if (body.charCodeAt(pos + 1) === 10) {
              pos += 2;
            } else {
              ++pos;
            }

            ++lexer.line;
            lexer.lineStart = pos;
            continue;

          case 33:
            //  !
            return new Token(TokenKind.BANG, pos, pos + 1, _line, _col, prev);

          case 35:
            //  #
            return readComment(source, pos, _line, _col, prev);

          case 36:
            //  $
            return new Token(TokenKind.DOLLAR, pos, pos + 1, _line, _col, prev);

          case 38:
            //  &
            return new Token(TokenKind.AMP, pos, pos + 1, _line, _col, prev);

          case 40:
            //  (
            return new Token(TokenKind.PAREN_L, pos, pos + 1, _line, _col, prev);

          case 41:
            //  )
            return new Token(TokenKind.PAREN_R, pos, pos + 1, _line, _col, prev);

          case 46:
            //  .
            if (body.charCodeAt(pos + 1) === 46 && body.charCodeAt(pos + 2) === 46) {
              return new Token(TokenKind.SPREAD, pos, pos + 3, _line, _col, prev);
            }

            break;

          case 58:
            //  :
            return new Token(TokenKind.COLON, pos, pos + 1, _line, _col, prev);

          case 61:
            //  =
            return new Token(TokenKind.EQUALS, pos, pos + 1, _line, _col, prev);

          case 64:
            //  @
            return new Token(TokenKind.AT, pos, pos + 1, _line, _col, prev);

          case 91:
            //  [
            return new Token(TokenKind.BRACKET_L, pos, pos + 1, _line, _col, prev);

          case 93:
            //  ]
            return new Token(TokenKind.BRACKET_R, pos, pos + 1, _line, _col, prev);

          case 123:
            // {
            return new Token(TokenKind.BRACE_L, pos, pos + 1, _line, _col, prev);

          case 124:
            // |
            return new Token(TokenKind.PIPE, pos, pos + 1, _line, _col, prev);

          case 125:
            // }
            return new Token(TokenKind.BRACE_R, pos, pos + 1, _line, _col, prev);

          case 34:
            //  "
            if (body.charCodeAt(pos + 1) === 34 && body.charCodeAt(pos + 2) === 34) {
              return readBlockString(source, pos, _line, _col, prev, lexer);
            }

            return readString(source, pos, _line, _col, prev);

          case 45: //  -

          case 48: //  0

          case 49: //  1

          case 50: //  2

          case 51: //  3

          case 52: //  4

          case 53: //  5

          case 54: //  6

          case 55: //  7

          case 56: //  8

          case 57:
            //  9
            return readNumber(source, pos, code, _line, _col, prev);

          case 65: //  A

          case 66: //  B

          case 67: //  C

          case 68: //  D

          case 69: //  E

          case 70: //  F

          case 71: //  G

          case 72: //  H

          case 73: //  I

          case 74: //  J

          case 75: //  K

          case 76: //  L

          case 77: //  M

          case 78: //  N

          case 79: //  O

          case 80: //  P

          case 81: //  Q

          case 82: //  R

          case 83: //  S

          case 84: //  T

          case 85: //  U

          case 86: //  V

          case 87: //  W

          case 88: //  X

          case 89: //  Y

          case 90: //  Z

          case 95: //  _

          case 97: //  a

          case 98: //  b

          case 99: //  c

          case 100: // d

          case 101: // e

          case 102: // f

          case 103: // g

          case 104: // h

          case 105: // i

          case 106: // j

          case 107: // k

          case 108: // l

          case 109: // m

          case 110: // n

          case 111: // o

          case 112: // p

          case 113: // q

          case 114: // r

          case 115: // s

          case 116: // t

          case 117: // u

          case 118: // v

          case 119: // w

          case 120: // x

          case 121: // y

          case 122:
            // z
            return readName(source, pos, _line, _col, prev);
        }

        throw syntaxError(source, pos, unexpectedCharacterMessage(code));
      }

      var line = lexer.line;
      var col = 1 + pos - lexer.lineStart;
      return new Token(TokenKind.EOF, bodyLength, bodyLength, line, col, prev);
    }
    /**
     * Report a message that an unexpected character was encountered.
     */


    function unexpectedCharacterMessage(code) {
      if (code < 0x0020 && code !== 0x0009 && code !== 0x000a && code !== 0x000d) {
        return "Cannot contain the invalid character ".concat(printCharCode(code), ".");
      }

      if (code === 39) {
        // '
        return 'Unexpected single quote character (\'), did you mean to use a double quote (")?';
      }

      return "Cannot parse the unexpected character ".concat(printCharCode(code), ".");
    }
    /**
     * Reads a comment token from the source file.
     *
     * #[\u0009\u0020-\uFFFF]*
     */


    function readComment(source, start, line, col, prev) {
      var body = source.body;
      var code;
      var position = start;

      do {
        code = body.charCodeAt(++position);
      } while (!isNaN(code) && ( // SourceCharacter but not LineTerminator
      code > 0x001f || code === 0x0009));

      return new Token(TokenKind.COMMENT, start, position, line, col, prev, body.slice(start + 1, position));
    }
    /**
     * Reads a number token from the source file, either a float
     * or an int depending on whether a decimal point appears.
     *
     * Int:   -?(0|[1-9][0-9]*)
     * Float: -?(0|[1-9][0-9]*)(\.[0-9]+)?((E|e)(+|-)?[0-9]+)?
     */


    function readNumber(source, start, firstCode, line, col, prev) {
      var body = source.body;
      var code = firstCode;
      var position = start;
      var isFloat = false;

      if (code === 45) {
        // -
        code = body.charCodeAt(++position);
      }

      if (code === 48) {
        // 0
        code = body.charCodeAt(++position);

        if (code >= 48 && code <= 57) {
          throw syntaxError(source, position, "Invalid number, unexpected digit after 0: ".concat(printCharCode(code), "."));
        }
      } else {
        position = readDigits(source, position, code);
        code = body.charCodeAt(position);
      }

      if (code === 46) {
        // .
        isFloat = true;
        code = body.charCodeAt(++position);
        position = readDigits(source, position, code);
        code = body.charCodeAt(position);
      }

      if (code === 69 || code === 101) {
        // E e
        isFloat = true;
        code = body.charCodeAt(++position);

        if (code === 43 || code === 45) {
          // + -
          code = body.charCodeAt(++position);
        }

        position = readDigits(source, position, code);
        code = body.charCodeAt(position);
      } // Numbers cannot be followed by . or NameStart


      if (code === 46 || isNameStart(code)) {
        throw syntaxError(source, position, "Invalid number, expected digit but got: ".concat(printCharCode(code), "."));
      }

      return new Token(isFloat ? TokenKind.FLOAT : TokenKind.INT, start, position, line, col, prev, body.slice(start, position));
    }
    /**
     * Returns the new position in the source after reading digits.
     */


    function readDigits(source, start, firstCode) {
      var body = source.body;
      var position = start;
      var code = firstCode;

      if (code >= 48 && code <= 57) {
        // 0 - 9
        do {
          code = body.charCodeAt(++position);
        } while (code >= 48 && code <= 57); // 0 - 9


        return position;
      }

      throw syntaxError(source, position, "Invalid number, expected digit but got: ".concat(printCharCode(code), "."));
    }
    /**
     * Reads a string token from the source file.
     *
     * "([^"\\\u000A\u000D]|(\\(u[0-9a-fA-F]{4}|["\\/bfnrt])))*"
     */


    function readString(source, start, line, col, prev) {
      var body = source.body;
      var position = start + 1;
      var chunkStart = position;
      var code = 0;
      var value = '';

      while (position < body.length && !isNaN(code = body.charCodeAt(position)) && // not LineTerminator
      code !== 0x000a && code !== 0x000d) {
        // Closing Quote (")
        if (code === 34) {
          value += body.slice(chunkStart, position);
          return new Token(TokenKind.STRING, start, position + 1, line, col, prev, value);
        } // SourceCharacter


        if (code < 0x0020 && code !== 0x0009) {
          throw syntaxError(source, position, "Invalid character within String: ".concat(printCharCode(code), "."));
        }

        ++position;

        if (code === 92) {
          // \
          value += body.slice(chunkStart, position - 1);
          code = body.charCodeAt(position);

          switch (code) {
            case 34:
              value += '"';
              break;

            case 47:
              value += '/';
              break;

            case 92:
              value += '\\';
              break;

            case 98:
              value += '\b';
              break;

            case 102:
              value += '\f';
              break;

            case 110:
              value += '\n';
              break;

            case 114:
              value += '\r';
              break;

            case 116:
              value += '\t';
              break;

            case 117:
              {
                // uXXXX
                var charCode = uniCharCode(body.charCodeAt(position + 1), body.charCodeAt(position + 2), body.charCodeAt(position + 3), body.charCodeAt(position + 4));

                if (charCode < 0) {
                  var invalidSequence = body.slice(position + 1, position + 5);
                  throw syntaxError(source, position, "Invalid character escape sequence: \\u".concat(invalidSequence, "."));
                }

                value += String.fromCharCode(charCode);
                position += 4;
                break;
              }

            default:
              throw syntaxError(source, position, "Invalid character escape sequence: \\".concat(String.fromCharCode(code), "."));
          }

          ++position;
          chunkStart = position;
        }
      }

      throw syntaxError(source, position, 'Unterminated string.');
    }
    /**
     * Reads a block string token from the source file.
     *
     * """("?"?(\\"""|\\(?!=""")|[^"\\]))*"""
     */


    function readBlockString(source, start, line, col, prev, lexer) {
      var body = source.body;
      var position = start + 3;
      var chunkStart = position;
      var code = 0;
      var rawValue = '';

      while (position < body.length && !isNaN(code = body.charCodeAt(position))) {
        // Closing Triple-Quote (""")
        if (code === 34 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34) {
          rawValue += body.slice(chunkStart, position);
          return new Token(TokenKind.BLOCK_STRING, start, position + 3, line, col, prev, dedentBlockStringValue(rawValue));
        } // SourceCharacter


        if (code < 0x0020 && code !== 0x0009 && code !== 0x000a && code !== 0x000d) {
          throw syntaxError(source, position, "Invalid character within String: ".concat(printCharCode(code), "."));
        }

        if (code === 10) {
          // new line
          ++position;
          ++lexer.line;
          lexer.lineStart = position;
        } else if (code === 13) {
          // carriage return
          if (body.charCodeAt(position + 1) === 10) {
            position += 2;
          } else {
            ++position;
          }

          ++lexer.line;
          lexer.lineStart = position;
        } else if ( // Escape Triple-Quote (\""")
        code === 92 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34 && body.charCodeAt(position + 3) === 34) {
          rawValue += body.slice(chunkStart, position) + '"""';
          position += 4;
          chunkStart = position;
        } else {
          ++position;
        }
      }

      throw syntaxError(source, position, 'Unterminated string.');
    }
    /**
     * Converts four hexadecimal chars to the integer that the
     * string represents. For example, uniCharCode('0','0','0','f')
     * will return 15, and uniCharCode('0','0','f','f') returns 255.
     *
     * Returns a negative number on error, if a char was invalid.
     *
     * This is implemented by noting that char2hex() returns -1 on error,
     * which means the result of ORing the char2hex() will also be negative.
     */


    function uniCharCode(a, b, c, d) {
      return char2hex(a) << 12 | char2hex(b) << 8 | char2hex(c) << 4 | char2hex(d);
    }
    /**
     * Converts a hex character to its integer value.
     * '0' becomes 0, '9' becomes 9
     * 'A' becomes 10, 'F' becomes 15
     * 'a' becomes 10, 'f' becomes 15
     *
     * Returns -1 on error.
     */


    function char2hex(a) {
      return a >= 48 && a <= 57 ? a - 48 // 0-9
      : a >= 65 && a <= 70 ? a - 55 // A-F
      : a >= 97 && a <= 102 ? a - 87 // a-f
      : -1;
    }
    /**
     * Reads an alphanumeric + underscore name from the source.
     *
     * [_A-Za-z][_0-9A-Za-z]*
     */


    function readName(source, start, line, col, prev) {
      var body = source.body;
      var bodyLength = body.length;
      var position = start + 1;
      var code = 0;

      while (position !== bodyLength && !isNaN(code = body.charCodeAt(position)) && (code === 95 || // _
      code >= 48 && code <= 57 || // 0-9
      code >= 65 && code <= 90 || // A-Z
      code >= 97 && code <= 122) // a-z
      ) {
        ++position;
      }

      return new Token(TokenKind.NAME, start, position, line, col, prev, body.slice(start, position));
    } // _ A-Z a-z


    function isNameStart(code) {
      return code === 95 || code >= 65 && code <= 90 || code >= 97 && code <= 122;
    }

    /**
     * Configuration options to control parser behavior
     */

    /**
     * Given a GraphQL source, parses it into a Document.
     * Throws GraphQLError if a syntax error is encountered.
     */
    function parse$3(source, options) {
      var parser = new Parser(source, options);
      return parser.parseDocument();
    }
    /**
     * This class is exported only to assist people in implementing their own parsers
     * without duplicating too much code and should be used only as last resort for cases
     * such as experimental syntax or if certain features could not be contributed upstream.
     *
     * It is still part of the internal API and is versioned, so any changes to it are never
     * considered breaking changes. If you still need to support multiple versions of the
     * library, please use the `versionInfo` variable for version detection.
     *
     * @internal
     */

    var Parser = /*#__PURE__*/function () {
      function Parser(source, options) {
        var sourceObj = isSource(source) ? source : new Source(source);
        this._lexer = new Lexer(sourceObj);
        this._options = options;
      }
      /**
       * Converts a name lex token into a name parse node.
       */


      var _proto = Parser.prototype;

      _proto.parseName = function parseName() {
        var token = this.expectToken(TokenKind.NAME);
        return {
          kind: Kind.NAME,
          value: token.value,
          loc: this.loc(token)
        };
      } // Implements the parsing rules in the Document section.

      /**
       * Document : Definition+
       */
      ;

      _proto.parseDocument = function parseDocument() {
        var start = this._lexer.token;
        return {
          kind: Kind.DOCUMENT,
          definitions: this.many(TokenKind.SOF, this.parseDefinition, TokenKind.EOF),
          loc: this.loc(start)
        };
      }
      /**
       * Definition :
       *   - ExecutableDefinition
       *   - TypeSystemDefinition
       *   - TypeSystemExtension
       *
       * ExecutableDefinition :
       *   - OperationDefinition
       *   - FragmentDefinition
       */
      ;

      _proto.parseDefinition = function parseDefinition() {
        if (this.peek(TokenKind.NAME)) {
          switch (this._lexer.token.value) {
            case 'query':
            case 'mutation':
            case 'subscription':
              return this.parseOperationDefinition();

            case 'fragment':
              return this.parseFragmentDefinition();

            case 'schema':
            case 'scalar':
            case 'type':
            case 'interface':
            case 'union':
            case 'enum':
            case 'input':
            case 'directive':
              return this.parseTypeSystemDefinition();

            case 'extend':
              return this.parseTypeSystemExtension();
          }
        } else if (this.peek(TokenKind.BRACE_L)) {
          return this.parseOperationDefinition();
        } else if (this.peekDescription()) {
          return this.parseTypeSystemDefinition();
        }

        throw this.unexpected();
      } // Implements the parsing rules in the Operations section.

      /**
       * OperationDefinition :
       *  - SelectionSet
       *  - OperationType Name? VariableDefinitions? Directives? SelectionSet
       */
      ;

      _proto.parseOperationDefinition = function parseOperationDefinition() {
        var start = this._lexer.token;

        if (this.peek(TokenKind.BRACE_L)) {
          return {
            kind: Kind.OPERATION_DEFINITION,
            operation: 'query',
            name: undefined,
            variableDefinitions: [],
            directives: [],
            selectionSet: this.parseSelectionSet(),
            loc: this.loc(start)
          };
        }

        var operation = this.parseOperationType();
        var name;

        if (this.peek(TokenKind.NAME)) {
          name = this.parseName();
        }

        return {
          kind: Kind.OPERATION_DEFINITION,
          operation: operation,
          name: name,
          variableDefinitions: this.parseVariableDefinitions(),
          directives: this.parseDirectives(false),
          selectionSet: this.parseSelectionSet(),
          loc: this.loc(start)
        };
      }
      /**
       * OperationType : one of query mutation subscription
       */
      ;

      _proto.parseOperationType = function parseOperationType() {
        var operationToken = this.expectToken(TokenKind.NAME);

        switch (operationToken.value) {
          case 'query':
            return 'query';

          case 'mutation':
            return 'mutation';

          case 'subscription':
            return 'subscription';
        }

        throw this.unexpected(operationToken);
      }
      /**
       * VariableDefinitions : ( VariableDefinition+ )
       */
      ;

      _proto.parseVariableDefinitions = function parseVariableDefinitions() {
        return this.optionalMany(TokenKind.PAREN_L, this.parseVariableDefinition, TokenKind.PAREN_R);
      }
      /**
       * VariableDefinition : Variable : Type DefaultValue? Directives[Const]?
       */
      ;

      _proto.parseVariableDefinition = function parseVariableDefinition() {
        var start = this._lexer.token;
        return {
          kind: Kind.VARIABLE_DEFINITION,
          variable: this.parseVariable(),
          type: (this.expectToken(TokenKind.COLON), this.parseTypeReference()),
          defaultValue: this.expectOptionalToken(TokenKind.EQUALS) ? this.parseValueLiteral(true) : undefined,
          directives: this.parseDirectives(true),
          loc: this.loc(start)
        };
      }
      /**
       * Variable : $ Name
       */
      ;

      _proto.parseVariable = function parseVariable() {
        var start = this._lexer.token;
        this.expectToken(TokenKind.DOLLAR);
        return {
          kind: Kind.VARIABLE,
          name: this.parseName(),
          loc: this.loc(start)
        };
      }
      /**
       * SelectionSet : { Selection+ }
       */
      ;

      _proto.parseSelectionSet = function parseSelectionSet() {
        var start = this._lexer.token;
        return {
          kind: Kind.SELECTION_SET,
          selections: this.many(TokenKind.BRACE_L, this.parseSelection, TokenKind.BRACE_R),
          loc: this.loc(start)
        };
      }
      /**
       * Selection :
       *   - Field
       *   - FragmentSpread
       *   - InlineFragment
       */
      ;

      _proto.parseSelection = function parseSelection() {
        return this.peek(TokenKind.SPREAD) ? this.parseFragment() : this.parseField();
      }
      /**
       * Field : Alias? Name Arguments? Directives? SelectionSet?
       *
       * Alias : Name :
       */
      ;

      _proto.parseField = function parseField() {
        var start = this._lexer.token;
        var nameOrAlias = this.parseName();
        var alias;
        var name;

        if (this.expectOptionalToken(TokenKind.COLON)) {
          alias = nameOrAlias;
          name = this.parseName();
        } else {
          name = nameOrAlias;
        }

        return {
          kind: Kind.FIELD,
          alias: alias,
          name: name,
          arguments: this.parseArguments(false),
          directives: this.parseDirectives(false),
          selectionSet: this.peek(TokenKind.BRACE_L) ? this.parseSelectionSet() : undefined,
          loc: this.loc(start)
        };
      }
      /**
       * Arguments[Const] : ( Argument[?Const]+ )
       */
      ;

      _proto.parseArguments = function parseArguments(isConst) {
        var item = isConst ? this.parseConstArgument : this.parseArgument;
        return this.optionalMany(TokenKind.PAREN_L, item, TokenKind.PAREN_R);
      }
      /**
       * Argument[Const] : Name : Value[?Const]
       */
      ;

      _proto.parseArgument = function parseArgument() {
        var start = this._lexer.token;
        var name = this.parseName();
        this.expectToken(TokenKind.COLON);
        return {
          kind: Kind.ARGUMENT,
          name: name,
          value: this.parseValueLiteral(false),
          loc: this.loc(start)
        };
      };

      _proto.parseConstArgument = function parseConstArgument() {
        var start = this._lexer.token;
        return {
          kind: Kind.ARGUMENT,
          name: this.parseName(),
          value: (this.expectToken(TokenKind.COLON), this.parseValueLiteral(true)),
          loc: this.loc(start)
        };
      } // Implements the parsing rules in the Fragments section.

      /**
       * Corresponds to both FragmentSpread and InlineFragment in the spec.
       *
       * FragmentSpread : ... FragmentName Directives?
       *
       * InlineFragment : ... TypeCondition? Directives? SelectionSet
       */
      ;

      _proto.parseFragment = function parseFragment() {
        var start = this._lexer.token;
        this.expectToken(TokenKind.SPREAD);
        var hasTypeCondition = this.expectOptionalKeyword('on');

        if (!hasTypeCondition && this.peek(TokenKind.NAME)) {
          return {
            kind: Kind.FRAGMENT_SPREAD,
            name: this.parseFragmentName(),
            directives: this.parseDirectives(false),
            loc: this.loc(start)
          };
        }

        return {
          kind: Kind.INLINE_FRAGMENT,
          typeCondition: hasTypeCondition ? this.parseNamedType() : undefined,
          directives: this.parseDirectives(false),
          selectionSet: this.parseSelectionSet(),
          loc: this.loc(start)
        };
      }
      /**
       * FragmentDefinition :
       *   - fragment FragmentName on TypeCondition Directives? SelectionSet
       *
       * TypeCondition : NamedType
       */
      ;

      _proto.parseFragmentDefinition = function parseFragmentDefinition() {
        var _this$_options;

        var start = this._lexer.token;
        this.expectKeyword('fragment'); // Experimental support for defining variables within fragments changes
        // the grammar of FragmentDefinition:
        //   - fragment FragmentName VariableDefinitions? on TypeCondition Directives? SelectionSet

        if (((_this$_options = this._options) === null || _this$_options === void 0 ? void 0 : _this$_options.experimentalFragmentVariables) === true) {
          return {
            kind: Kind.FRAGMENT_DEFINITION,
            name: this.parseFragmentName(),
            variableDefinitions: this.parseVariableDefinitions(),
            typeCondition: (this.expectKeyword('on'), this.parseNamedType()),
            directives: this.parseDirectives(false),
            selectionSet: this.parseSelectionSet(),
            loc: this.loc(start)
          };
        }

        return {
          kind: Kind.FRAGMENT_DEFINITION,
          name: this.parseFragmentName(),
          typeCondition: (this.expectKeyword('on'), this.parseNamedType()),
          directives: this.parseDirectives(false),
          selectionSet: this.parseSelectionSet(),
          loc: this.loc(start)
        };
      }
      /**
       * FragmentName : Name but not `on`
       */
      ;

      _proto.parseFragmentName = function parseFragmentName() {
        if (this._lexer.token.value === 'on') {
          throw this.unexpected();
        }

        return this.parseName();
      } // Implements the parsing rules in the Values section.

      /**
       * Value[Const] :
       *   - [~Const] Variable
       *   - IntValue
       *   - FloatValue
       *   - StringValue
       *   - BooleanValue
       *   - NullValue
       *   - EnumValue
       *   - ListValue[?Const]
       *   - ObjectValue[?Const]
       *
       * BooleanValue : one of `true` `false`
       *
       * NullValue : `null`
       *
       * EnumValue : Name but not `true`, `false` or `null`
       */
      ;

      _proto.parseValueLiteral = function parseValueLiteral(isConst) {
        var token = this._lexer.token;

        switch (token.kind) {
          case TokenKind.BRACKET_L:
            return this.parseList(isConst);

          case TokenKind.BRACE_L:
            return this.parseObject(isConst);

          case TokenKind.INT:
            this._lexer.advance();

            return {
              kind: Kind.INT,
              value: token.value,
              loc: this.loc(token)
            };

          case TokenKind.FLOAT:
            this._lexer.advance();

            return {
              kind: Kind.FLOAT,
              value: token.value,
              loc: this.loc(token)
            };

          case TokenKind.STRING:
          case TokenKind.BLOCK_STRING:
            return this.parseStringLiteral();

          case TokenKind.NAME:
            this._lexer.advance();

            switch (token.value) {
              case 'true':
                return {
                  kind: Kind.BOOLEAN,
                  value: true,
                  loc: this.loc(token)
                };

              case 'false':
                return {
                  kind: Kind.BOOLEAN,
                  value: false,
                  loc: this.loc(token)
                };

              case 'null':
                return {
                  kind: Kind.NULL,
                  loc: this.loc(token)
                };

              default:
                return {
                  kind: Kind.ENUM,
                  value: token.value,
                  loc: this.loc(token)
                };
            }

          case TokenKind.DOLLAR:
            if (!isConst) {
              return this.parseVariable();
            }

            break;
        }

        throw this.unexpected();
      };

      _proto.parseStringLiteral = function parseStringLiteral() {
        var token = this._lexer.token;

        this._lexer.advance();

        return {
          kind: Kind.STRING,
          value: token.value,
          block: token.kind === TokenKind.BLOCK_STRING,
          loc: this.loc(token)
        };
      }
      /**
       * ListValue[Const] :
       *   - [ ]
       *   - [ Value[?Const]+ ]
       */
      ;

      _proto.parseList = function parseList(isConst) {
        var _this = this;

        var start = this._lexer.token;

        var item = function item() {
          return _this.parseValueLiteral(isConst);
        };

        return {
          kind: Kind.LIST,
          values: this.any(TokenKind.BRACKET_L, item, TokenKind.BRACKET_R),
          loc: this.loc(start)
        };
      }
      /**
       * ObjectValue[Const] :
       *   - { }
       *   - { ObjectField[?Const]+ }
       */
      ;

      _proto.parseObject = function parseObject(isConst) {
        var _this2 = this;

        var start = this._lexer.token;

        var item = function item() {
          return _this2.parseObjectField(isConst);
        };

        return {
          kind: Kind.OBJECT,
          fields: this.any(TokenKind.BRACE_L, item, TokenKind.BRACE_R),
          loc: this.loc(start)
        };
      }
      /**
       * ObjectField[Const] : Name : Value[?Const]
       */
      ;

      _proto.parseObjectField = function parseObjectField(isConst) {
        var start = this._lexer.token;
        var name = this.parseName();
        this.expectToken(TokenKind.COLON);
        return {
          kind: Kind.OBJECT_FIELD,
          name: name,
          value: this.parseValueLiteral(isConst),
          loc: this.loc(start)
        };
      } // Implements the parsing rules in the Directives section.

      /**
       * Directives[Const] : Directive[?Const]+
       */
      ;

      _proto.parseDirectives = function parseDirectives(isConst) {
        var directives = [];

        while (this.peek(TokenKind.AT)) {
          directives.push(this.parseDirective(isConst));
        }

        return directives;
      }
      /**
       * Directive[Const] : @ Name Arguments[?Const]?
       */
      ;

      _proto.parseDirective = function parseDirective(isConst) {
        var start = this._lexer.token;
        this.expectToken(TokenKind.AT);
        return {
          kind: Kind.DIRECTIVE,
          name: this.parseName(),
          arguments: this.parseArguments(isConst),
          loc: this.loc(start)
        };
      } // Implements the parsing rules in the Types section.

      /**
       * Type :
       *   - NamedType
       *   - ListType
       *   - NonNullType
       */
      ;

      _proto.parseTypeReference = function parseTypeReference() {
        var start = this._lexer.token;
        var type;

        if (this.expectOptionalToken(TokenKind.BRACKET_L)) {
          type = this.parseTypeReference();
          this.expectToken(TokenKind.BRACKET_R);
          type = {
            kind: Kind.LIST_TYPE,
            type: type,
            loc: this.loc(start)
          };
        } else {
          type = this.parseNamedType();
        }

        if (this.expectOptionalToken(TokenKind.BANG)) {
          return {
            kind: Kind.NON_NULL_TYPE,
            type: type,
            loc: this.loc(start)
          };
        }

        return type;
      }
      /**
       * NamedType : Name
       */
      ;

      _proto.parseNamedType = function parseNamedType() {
        var start = this._lexer.token;
        return {
          kind: Kind.NAMED_TYPE,
          name: this.parseName(),
          loc: this.loc(start)
        };
      } // Implements the parsing rules in the Type Definition section.

      /**
       * TypeSystemDefinition :
       *   - SchemaDefinition
       *   - TypeDefinition
       *   - DirectiveDefinition
       *
       * TypeDefinition :
       *   - ScalarTypeDefinition
       *   - ObjectTypeDefinition
       *   - InterfaceTypeDefinition
       *   - UnionTypeDefinition
       *   - EnumTypeDefinition
       *   - InputObjectTypeDefinition
       */
      ;

      _proto.parseTypeSystemDefinition = function parseTypeSystemDefinition() {
        // Many definitions begin with a description and require a lookahead.
        var keywordToken = this.peekDescription() ? this._lexer.lookahead() : this._lexer.token;

        if (keywordToken.kind === TokenKind.NAME) {
          switch (keywordToken.value) {
            case 'schema':
              return this.parseSchemaDefinition();

            case 'scalar':
              return this.parseScalarTypeDefinition();

            case 'type':
              return this.parseObjectTypeDefinition();

            case 'interface':
              return this.parseInterfaceTypeDefinition();

            case 'union':
              return this.parseUnionTypeDefinition();

            case 'enum':
              return this.parseEnumTypeDefinition();

            case 'input':
              return this.parseInputObjectTypeDefinition();

            case 'directive':
              return this.parseDirectiveDefinition();
          }
        }

        throw this.unexpected(keywordToken);
      };

      _proto.peekDescription = function peekDescription() {
        return this.peek(TokenKind.STRING) || this.peek(TokenKind.BLOCK_STRING);
      }
      /**
       * Description : StringValue
       */
      ;

      _proto.parseDescription = function parseDescription() {
        if (this.peekDescription()) {
          return this.parseStringLiteral();
        }
      }
      /**
       * SchemaDefinition : Description? schema Directives[Const]? { OperationTypeDefinition+ }
       */
      ;

      _proto.parseSchemaDefinition = function parseSchemaDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('schema');
        var directives = this.parseDirectives(true);
        var operationTypes = this.many(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);
        return {
          kind: Kind.SCHEMA_DEFINITION,
          description: description,
          directives: directives,
          operationTypes: operationTypes,
          loc: this.loc(start)
        };
      }
      /**
       * OperationTypeDefinition : OperationType : NamedType
       */
      ;

      _proto.parseOperationTypeDefinition = function parseOperationTypeDefinition() {
        var start = this._lexer.token;
        var operation = this.parseOperationType();
        this.expectToken(TokenKind.COLON);
        var type = this.parseNamedType();
        return {
          kind: Kind.OPERATION_TYPE_DEFINITION,
          operation: operation,
          type: type,
          loc: this.loc(start)
        };
      }
      /**
       * ScalarTypeDefinition : Description? scalar Name Directives[Const]?
       */
      ;

      _proto.parseScalarTypeDefinition = function parseScalarTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('scalar');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        return {
          kind: Kind.SCALAR_TYPE_DEFINITION,
          description: description,
          name: name,
          directives: directives,
          loc: this.loc(start)
        };
      }
      /**
       * ObjectTypeDefinition :
       *   Description?
       *   type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition?
       */
      ;

      _proto.parseObjectTypeDefinition = function parseObjectTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('type');
        var name = this.parseName();
        var interfaces = this.parseImplementsInterfaces();
        var directives = this.parseDirectives(true);
        var fields = this.parseFieldsDefinition();
        return {
          kind: Kind.OBJECT_TYPE_DEFINITION,
          description: description,
          name: name,
          interfaces: interfaces,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * ImplementsInterfaces :
       *   - implements `&`? NamedType
       *   - ImplementsInterfaces & NamedType
       */
      ;

      _proto.parseImplementsInterfaces = function parseImplementsInterfaces() {
        var _this$_options2;

        if (!this.expectOptionalKeyword('implements')) {
          return [];
        }

        if (((_this$_options2 = this._options) === null || _this$_options2 === void 0 ? void 0 : _this$_options2.allowLegacySDLImplementsInterfaces) === true) {
          var types = []; // Optional leading ampersand

          this.expectOptionalToken(TokenKind.AMP);

          do {
            types.push(this.parseNamedType());
          } while (this.expectOptionalToken(TokenKind.AMP) || this.peek(TokenKind.NAME));

          return types;
        }

        return this.delimitedMany(TokenKind.AMP, this.parseNamedType);
      }
      /**
       * FieldsDefinition : { FieldDefinition+ }
       */
      ;

      _proto.parseFieldsDefinition = function parseFieldsDefinition() {
        var _this$_options3;

        // Legacy support for the SDL?
        if (((_this$_options3 = this._options) === null || _this$_options3 === void 0 ? void 0 : _this$_options3.allowLegacySDLEmptyFields) === true && this.peek(TokenKind.BRACE_L) && this._lexer.lookahead().kind === TokenKind.BRACE_R) {
          this._lexer.advance();

          this._lexer.advance();

          return [];
        }

        return this.optionalMany(TokenKind.BRACE_L, this.parseFieldDefinition, TokenKind.BRACE_R);
      }
      /**
       * FieldDefinition :
       *   - Description? Name ArgumentsDefinition? : Type Directives[Const]?
       */
      ;

      _proto.parseFieldDefinition = function parseFieldDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        var name = this.parseName();
        var args = this.parseArgumentDefs();
        this.expectToken(TokenKind.COLON);
        var type = this.parseTypeReference();
        var directives = this.parseDirectives(true);
        return {
          kind: Kind.FIELD_DEFINITION,
          description: description,
          name: name,
          arguments: args,
          type: type,
          directives: directives,
          loc: this.loc(start)
        };
      }
      /**
       * ArgumentsDefinition : ( InputValueDefinition+ )
       */
      ;

      _proto.parseArgumentDefs = function parseArgumentDefs() {
        return this.optionalMany(TokenKind.PAREN_L, this.parseInputValueDef, TokenKind.PAREN_R);
      }
      /**
       * InputValueDefinition :
       *   - Description? Name : Type DefaultValue? Directives[Const]?
       */
      ;

      _proto.parseInputValueDef = function parseInputValueDef() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        var name = this.parseName();
        this.expectToken(TokenKind.COLON);
        var type = this.parseTypeReference();
        var defaultValue;

        if (this.expectOptionalToken(TokenKind.EQUALS)) {
          defaultValue = this.parseValueLiteral(true);
        }

        var directives = this.parseDirectives(true);
        return {
          kind: Kind.INPUT_VALUE_DEFINITION,
          description: description,
          name: name,
          type: type,
          defaultValue: defaultValue,
          directives: directives,
          loc: this.loc(start)
        };
      }
      /**
       * InterfaceTypeDefinition :
       *   - Description? interface Name Directives[Const]? FieldsDefinition?
       */
      ;

      _proto.parseInterfaceTypeDefinition = function parseInterfaceTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('interface');
        var name = this.parseName();
        var interfaces = this.parseImplementsInterfaces();
        var directives = this.parseDirectives(true);
        var fields = this.parseFieldsDefinition();
        return {
          kind: Kind.INTERFACE_TYPE_DEFINITION,
          description: description,
          name: name,
          interfaces: interfaces,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * UnionTypeDefinition :
       *   - Description? union Name Directives[Const]? UnionMemberTypes?
       */
      ;

      _proto.parseUnionTypeDefinition = function parseUnionTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('union');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var types = this.parseUnionMemberTypes();
        return {
          kind: Kind.UNION_TYPE_DEFINITION,
          description: description,
          name: name,
          directives: directives,
          types: types,
          loc: this.loc(start)
        };
      }
      /**
       * UnionMemberTypes :
       *   - = `|`? NamedType
       *   - UnionMemberTypes | NamedType
       */
      ;

      _proto.parseUnionMemberTypes = function parseUnionMemberTypes() {
        return this.expectOptionalToken(TokenKind.EQUALS) ? this.delimitedMany(TokenKind.PIPE, this.parseNamedType) : [];
      }
      /**
       * EnumTypeDefinition :
       *   - Description? enum Name Directives[Const]? EnumValuesDefinition?
       */
      ;

      _proto.parseEnumTypeDefinition = function parseEnumTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('enum');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var values = this.parseEnumValuesDefinition();
        return {
          kind: Kind.ENUM_TYPE_DEFINITION,
          description: description,
          name: name,
          directives: directives,
          values: values,
          loc: this.loc(start)
        };
      }
      /**
       * EnumValuesDefinition : { EnumValueDefinition+ }
       */
      ;

      _proto.parseEnumValuesDefinition = function parseEnumValuesDefinition() {
        return this.optionalMany(TokenKind.BRACE_L, this.parseEnumValueDefinition, TokenKind.BRACE_R);
      }
      /**
       * EnumValueDefinition : Description? EnumValue Directives[Const]?
       *
       * EnumValue : Name
       */
      ;

      _proto.parseEnumValueDefinition = function parseEnumValueDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        return {
          kind: Kind.ENUM_VALUE_DEFINITION,
          description: description,
          name: name,
          directives: directives,
          loc: this.loc(start)
        };
      }
      /**
       * InputObjectTypeDefinition :
       *   - Description? input Name Directives[Const]? InputFieldsDefinition?
       */
      ;

      _proto.parseInputObjectTypeDefinition = function parseInputObjectTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('input');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var fields = this.parseInputFieldsDefinition();
        return {
          kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
          description: description,
          name: name,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * InputFieldsDefinition : { InputValueDefinition+ }
       */
      ;

      _proto.parseInputFieldsDefinition = function parseInputFieldsDefinition() {
        return this.optionalMany(TokenKind.BRACE_L, this.parseInputValueDef, TokenKind.BRACE_R);
      }
      /**
       * TypeSystemExtension :
       *   - SchemaExtension
       *   - TypeExtension
       *
       * TypeExtension :
       *   - ScalarTypeExtension
       *   - ObjectTypeExtension
       *   - InterfaceTypeExtension
       *   - UnionTypeExtension
       *   - EnumTypeExtension
       *   - InputObjectTypeDefinition
       */
      ;

      _proto.parseTypeSystemExtension = function parseTypeSystemExtension() {
        var keywordToken = this._lexer.lookahead();

        if (keywordToken.kind === TokenKind.NAME) {
          switch (keywordToken.value) {
            case 'schema':
              return this.parseSchemaExtension();

            case 'scalar':
              return this.parseScalarTypeExtension();

            case 'type':
              return this.parseObjectTypeExtension();

            case 'interface':
              return this.parseInterfaceTypeExtension();

            case 'union':
              return this.parseUnionTypeExtension();

            case 'enum':
              return this.parseEnumTypeExtension();

            case 'input':
              return this.parseInputObjectTypeExtension();
          }
        }

        throw this.unexpected(keywordToken);
      }
      /**
       * SchemaExtension :
       *  - extend schema Directives[Const]? { OperationTypeDefinition+ }
       *  - extend schema Directives[Const]
       */
      ;

      _proto.parseSchemaExtension = function parseSchemaExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('schema');
        var directives = this.parseDirectives(true);
        var operationTypes = this.optionalMany(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);

        if (directives.length === 0 && operationTypes.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.SCHEMA_EXTENSION,
          directives: directives,
          operationTypes: operationTypes,
          loc: this.loc(start)
        };
      }
      /**
       * ScalarTypeExtension :
       *   - extend scalar Name Directives[Const]
       */
      ;

      _proto.parseScalarTypeExtension = function parseScalarTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('scalar');
        var name = this.parseName();
        var directives = this.parseDirectives(true);

        if (directives.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.SCALAR_TYPE_EXTENSION,
          name: name,
          directives: directives,
          loc: this.loc(start)
        };
      }
      /**
       * ObjectTypeExtension :
       *  - extend type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition
       *  - extend type Name ImplementsInterfaces? Directives[Const]
       *  - extend type Name ImplementsInterfaces
       */
      ;

      _proto.parseObjectTypeExtension = function parseObjectTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('type');
        var name = this.parseName();
        var interfaces = this.parseImplementsInterfaces();
        var directives = this.parseDirectives(true);
        var fields = this.parseFieldsDefinition();

        if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.OBJECT_TYPE_EXTENSION,
          name: name,
          interfaces: interfaces,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * InterfaceTypeExtension :
       *  - extend interface Name ImplementsInterfaces? Directives[Const]? FieldsDefinition
       *  - extend interface Name ImplementsInterfaces? Directives[Const]
       *  - extend interface Name ImplementsInterfaces
       */
      ;

      _proto.parseInterfaceTypeExtension = function parseInterfaceTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('interface');
        var name = this.parseName();
        var interfaces = this.parseImplementsInterfaces();
        var directives = this.parseDirectives(true);
        var fields = this.parseFieldsDefinition();

        if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.INTERFACE_TYPE_EXTENSION,
          name: name,
          interfaces: interfaces,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * UnionTypeExtension :
       *   - extend union Name Directives[Const]? UnionMemberTypes
       *   - extend union Name Directives[Const]
       */
      ;

      _proto.parseUnionTypeExtension = function parseUnionTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('union');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var types = this.parseUnionMemberTypes();

        if (directives.length === 0 && types.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.UNION_TYPE_EXTENSION,
          name: name,
          directives: directives,
          types: types,
          loc: this.loc(start)
        };
      }
      /**
       * EnumTypeExtension :
       *   - extend enum Name Directives[Const]? EnumValuesDefinition
       *   - extend enum Name Directives[Const]
       */
      ;

      _proto.parseEnumTypeExtension = function parseEnumTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('enum');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var values = this.parseEnumValuesDefinition();

        if (directives.length === 0 && values.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.ENUM_TYPE_EXTENSION,
          name: name,
          directives: directives,
          values: values,
          loc: this.loc(start)
        };
      }
      /**
       * InputObjectTypeExtension :
       *   - extend input Name Directives[Const]? InputFieldsDefinition
       *   - extend input Name Directives[Const]
       */
      ;

      _proto.parseInputObjectTypeExtension = function parseInputObjectTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('input');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var fields = this.parseInputFieldsDefinition();

        if (directives.length === 0 && fields.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.INPUT_OBJECT_TYPE_EXTENSION,
          name: name,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * DirectiveDefinition :
       *   - Description? directive @ Name ArgumentsDefinition? `repeatable`? on DirectiveLocations
       */
      ;

      _proto.parseDirectiveDefinition = function parseDirectiveDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('directive');
        this.expectToken(TokenKind.AT);
        var name = this.parseName();
        var args = this.parseArgumentDefs();
        var repeatable = this.expectOptionalKeyword('repeatable');
        this.expectKeyword('on');
        var locations = this.parseDirectiveLocations();
        return {
          kind: Kind.DIRECTIVE_DEFINITION,
          description: description,
          name: name,
          arguments: args,
          repeatable: repeatable,
          locations: locations,
          loc: this.loc(start)
        };
      }
      /**
       * DirectiveLocations :
       *   - `|`? DirectiveLocation
       *   - DirectiveLocations | DirectiveLocation
       */
      ;

      _proto.parseDirectiveLocations = function parseDirectiveLocations() {
        return this.delimitedMany(TokenKind.PIPE, this.parseDirectiveLocation);
      }
      /*
       * DirectiveLocation :
       *   - ExecutableDirectiveLocation
       *   - TypeSystemDirectiveLocation
       *
       * ExecutableDirectiveLocation : one of
       *   `QUERY`
       *   `MUTATION`
       *   `SUBSCRIPTION`
       *   `FIELD`
       *   `FRAGMENT_DEFINITION`
       *   `FRAGMENT_SPREAD`
       *   `INLINE_FRAGMENT`
       *
       * TypeSystemDirectiveLocation : one of
       *   `SCHEMA`
       *   `SCALAR`
       *   `OBJECT`
       *   `FIELD_DEFINITION`
       *   `ARGUMENT_DEFINITION`
       *   `INTERFACE`
       *   `UNION`
       *   `ENUM`
       *   `ENUM_VALUE`
       *   `INPUT_OBJECT`
       *   `INPUT_FIELD_DEFINITION`
       */
      ;

      _proto.parseDirectiveLocation = function parseDirectiveLocation() {
        var start = this._lexer.token;
        var name = this.parseName();

        if (DirectiveLocation[name.value] !== undefined) {
          return name;
        }

        throw this.unexpected(start);
      } // Core parsing utility functions

      /**
       * Returns a location object, used to identify the place in the source that created a given parsed object.
       */
      ;

      _proto.loc = function loc(startToken) {
        var _this$_options4;

        if (((_this$_options4 = this._options) === null || _this$_options4 === void 0 ? void 0 : _this$_options4.noLocation) !== true) {
          return new Location(startToken, this._lexer.lastToken, this._lexer.source);
        }
      }
      /**
       * Determines if the next token is of a given kind
       */
      ;

      _proto.peek = function peek(kind) {
        return this._lexer.token.kind === kind;
      }
      /**
       * If the next token is of the given kind, return that token after advancing the lexer.
       * Otherwise, do not change the parser state and throw an error.
       */
      ;

      _proto.expectToken = function expectToken(kind) {
        var token = this._lexer.token;

        if (token.kind === kind) {
          this._lexer.advance();

          return token;
        }

        throw syntaxError(this._lexer.source, token.start, "Expected ".concat(getTokenKindDesc(kind), ", found ").concat(getTokenDesc(token), "."));
      }
      /**
       * If the next token is of the given kind, return that token after advancing the lexer.
       * Otherwise, do not change the parser state and return undefined.
       */
      ;

      _proto.expectOptionalToken = function expectOptionalToken(kind) {
        var token = this._lexer.token;

        if (token.kind === kind) {
          this._lexer.advance();

          return token;
        }

        return undefined;
      }
      /**
       * If the next token is a given keyword, advance the lexer.
       * Otherwise, do not change the parser state and throw an error.
       */
      ;

      _proto.expectKeyword = function expectKeyword(value) {
        var token = this._lexer.token;

        if (token.kind === TokenKind.NAME && token.value === value) {
          this._lexer.advance();
        } else {
          throw syntaxError(this._lexer.source, token.start, "Expected \"".concat(value, "\", found ").concat(getTokenDesc(token), "."));
        }
      }
      /**
       * If the next token is a given keyword, return "true" after advancing the lexer.
       * Otherwise, do not change the parser state and return "false".
       */
      ;

      _proto.expectOptionalKeyword = function expectOptionalKeyword(value) {
        var token = this._lexer.token;

        if (token.kind === TokenKind.NAME && token.value === value) {
          this._lexer.advance();

          return true;
        }

        return false;
      }
      /**
       * Helper function for creating an error when an unexpected lexed token is encountered.
       */
      ;

      _proto.unexpected = function unexpected(atToken) {
        var token = atToken !== null && atToken !== void 0 ? atToken : this._lexer.token;
        return syntaxError(this._lexer.source, token.start, "Unexpected ".concat(getTokenDesc(token), "."));
      }
      /**
       * Returns a possibly empty list of parse nodes, determined by the parseFn.
       * This list begins with a lex token of openKind and ends with a lex token of closeKind.
       * Advances the parser to the next lex token after the closing token.
       */
      ;

      _proto.any = function any(openKind, parseFn, closeKind) {
        this.expectToken(openKind);
        var nodes = [];

        while (!this.expectOptionalToken(closeKind)) {
          nodes.push(parseFn.call(this));
        }

        return nodes;
      }
      /**
       * Returns a list of parse nodes, determined by the parseFn.
       * It can be empty only if open token is missing otherwise it will always return non-empty list
       * that begins with a lex token of openKind and ends with a lex token of closeKind.
       * Advances the parser to the next lex token after the closing token.
       */
      ;

      _proto.optionalMany = function optionalMany(openKind, parseFn, closeKind) {
        if (this.expectOptionalToken(openKind)) {
          var nodes = [];

          do {
            nodes.push(parseFn.call(this));
          } while (!this.expectOptionalToken(closeKind));

          return nodes;
        }

        return [];
      }
      /**
       * Returns a non-empty list of parse nodes, determined by the parseFn.
       * This list begins with a lex token of openKind and ends with a lex token of closeKind.
       * Advances the parser to the next lex token after the closing token.
       */
      ;

      _proto.many = function many(openKind, parseFn, closeKind) {
        this.expectToken(openKind);
        var nodes = [];

        do {
          nodes.push(parseFn.call(this));
        } while (!this.expectOptionalToken(closeKind));

        return nodes;
      }
      /**
       * Returns a non-empty list of parse nodes, determined by the parseFn.
       * This list may begin with a lex token of delimiterKind followed by items separated by lex tokens of tokenKind.
       * Advances the parser to the next lex token after last item in the list.
       */
      ;

      _proto.delimitedMany = function delimitedMany(delimiterKind, parseFn) {
        this.expectOptionalToken(delimiterKind);
        var nodes = [];

        do {
          nodes.push(parseFn.call(this));
        } while (this.expectOptionalToken(delimiterKind));

        return nodes;
      };

      return Parser;
    }();
    /**
     * A helper function to describe a token as a string for debugging.
     */

    function getTokenDesc(token) {
      var value = token.value;
      return getTokenKindDesc(token.kind) + (value != null ? " \"".concat(value, "\"") : '');
    }
    /**
     * A helper function to describe a token kind as a string for debugging.
     */


    function getTokenKindDesc(kind) {
      return isPunctuatorTokenKind(kind) ? "\"".concat(kind, "\"") : kind;
    }

    function parseDocumentNode(node) {
        var _a;
        const operationDef = node.definitions.find((def) => {
            return def.kind === 'OperationDefinition';
        });
        return {
            operationType: operationDef === null || operationDef === void 0 ? void 0 : operationDef.operation,
            operationName: (_a = operationDef === null || operationDef === void 0 ? void 0 : operationDef.name) === null || _a === void 0 ? void 0 : _a.value,
        };
    }
    function parseQuery(query) {
        try {
            const ast = parse$3(query);
            return parseDocumentNode(ast);
        }
        catch (error) {
            return error;
        }
    }
    function extractMultipartVariables(variables, map, files) {
        const operations = { variables };
        for (const [key, pathArray] of Object.entries(map)) {
            if (!(key in files)) {
                throw new Error(`Given files do not have a key '${key}' .`);
            }
            for (const dotPath of pathArray) {
                const [lastPath, ...reversedPaths] = dotPath.split('.').reverse();
                const paths = reversedPaths.reverse();
                let target = operations;
                for (const path of paths) {
                    if (!(path in target)) {
                        throw new Error(`Property '${paths}' is not in operations.`);
                    }
                    target = target[path];
                }
                target[lastPath] = files[key];
            }
        }
        return operations.variables;
    }
    function getGraphQLInput(request) {
        var _a, _b;
        switch (request.method) {
            case 'GET': {
                const query = request.url.searchParams.get('query');
                const variables = request.url.searchParams.get('variables') || '';
                return {
                    query,
                    variables: jsonParse(variables),
                };
            }
            case 'POST': {
                if ((_a = request.body) === null || _a === void 0 ? void 0 : _a.query) {
                    const { query, variables } = request.body;
                    return {
                        query,
                        variables,
                    };
                }
                // Handle multipart body operations.
                if ((_b = request.body) === null || _b === void 0 ? void 0 : _b.operations) {
                    const _c = request.body, { operations, map } = _c, files = __rest(_c, ["operations", "map"]);
                    const parsedOperations = jsonParse(operations) || {};
                    if (!parsedOperations.query) {
                        return null;
                    }
                    const parsedMap = jsonParse(map || '') || {};
                    const variables = parsedOperations.variables
                        ? extractMultipartVariables(parsedOperations.variables, parsedMap, files)
                        : {};
                    return {
                        query: parsedOperations.query,
                        variables,
                    };
                }
            }
            default:
                return null;
        }
    }
    /**
     * Determines if a given request can be considered a GraphQL request.
     * Does not parse the query and does not guarantee its validity.
     */
    function parseGraphQLRequest(request) {
        const input = getGraphQLInput(request);
        if (!input || !input.query) {
            return undefined;
        }
        const { query, variables } = input;
        const parsedResult = parseQuery(query);
        if (parsedResult instanceof Error) {
            const requestPublicUrl = getPublicUrlFromRequest(request);
            throw new Error(devUtils.formatMessage('Failed to intercept a GraphQL request to "%s %s": cannot parse query. See the error message from the parser below.\n\n%s', request.method, requestPublicUrl, parsedResult.message));
        }
        return {
            operationType: parsedResult.operationType,
            operationName: parsedResult.operationName,
            variables,
        };
    }

    function tryCatch(fn, onException) {
        try {
            const result = fn();
            return result;
        }
        catch (error) {
            onException === null || onException === void 0 ? void 0 : onException(error);
        }
    }

    const graphqlContext = {
        set,
        status: status$3,
        delay,
        fetch: fetch$2,
        data: data$3,
        errors,
        cookie,
    };
    function isDocumentNode(value) {
        if (value == null) {
            return false;
        }
        return typeof value === 'object' && 'kind' in value && 'definitions' in value;
    }
    class GraphQLHandler extends RequestHandler {
        constructor(operationType, operationName, endpoint, resolver) {
            let resolvedOperationName = operationName;
            if (isDocumentNode(operationName)) {
                const parsedNode = parseDocumentNode(operationName);
                if (parsedNode.operationType !== operationType) {
                    throw new Error(`Failed to create a GraphQL handler: provided a DocumentNode with a mismatched operation type (expected "${operationType}", but got "${parsedNode.operationType}").`);
                }
                if (!parsedNode.operationName) {
                    throw new Error(`Failed to create a GraphQL handler: provided a DocumentNode with no operation name.`);
                }
                resolvedOperationName = parsedNode.operationName;
            }
            const header = operationType === 'all'
                ? `${operationType} (origin: ${endpoint.toString()})`
                : `${operationType} ${resolvedOperationName} (origin: ${endpoint.toString()})`;
            super({
                info: {
                    header,
                    operationType,
                    operationName: resolvedOperationName,
                },
                ctx: graphqlContext,
                resolver,
            });
            this.endpoint = endpoint;
        }
        parse(request) {
            return tryCatch(() => parseGraphQLRequest(request), (error) => console.error(error.message));
        }
        getPublicRequest(request, parsedResult) {
            return Object.assign(Object.assign({}, request), { variables: (parsedResult === null || parsedResult === void 0 ? void 0 : parsedResult.variables) || {} });
        }
        predicate(request, parsedResult) {
            if (!parsedResult) {
                return false;
            }
            if (!parsedResult.operationName) {
                const publicUrl = getPublicUrlFromRequest(request);
                devUtils.warn(`\
Failed to intercept a GraphQL request at "${request.method} ${publicUrl}": unnamed GraphQL operations are not supported.

Consider naming this operation or using "graphql.operation" request handler to intercept GraphQL requests regardless of their operation name/type. Read more: https://mswjs.io/docs/api/graphql/operation\
      `);
                return false;
            }
            const hasMatchingUrl = matchRequestUrl(request.url, this.endpoint);
            const hasMatchingOperationType = this.info.operationType === 'all' ||
                parsedResult.operationType === this.info.operationType;
            const hasMatchingOperationName = this.info.operationName instanceof RegExp
                ? this.info.operationName.test(parsedResult.operationName)
                : parsedResult.operationName === this.info.operationName;
            return (hasMatchingUrl.matches &&
                hasMatchingOperationType &&
                hasMatchingOperationName);
        }
        log(request, response, handler, parsedRequest) {
            const loggedRequest = prepareRequest(request);
            const loggedResponse = prepareResponse(response);
            const statusColor = getStatusCodeColor(response.status);
            console.groupCollapsed(devUtils.formatMessage('%s %s (%c%s%c)'), getTimestamp(), `${parsedRequest === null || parsedRequest === void 0 ? void 0 : parsedRequest.operationType} ${parsedRequest === null || parsedRequest === void 0 ? void 0 : parsedRequest.operationName}`, `color:${statusColor}`, `${response.status} ${response.statusText}`, 'color:inherit');
            console.log('Request:', loggedRequest);
            console.log('Handler:', this);
            console.log('Response:', loggedResponse);
            console.groupEnd();
        }
    }

    function createScopedGraphQLHandler(operationType, url) {
        return (operationName, resolver) => {
            return new GraphQLHandler(operationType, operationName, url, resolver);
        };
    }
    function createGraphQLOperationHandler(url) {
        return (resolver) => {
            return new GraphQLHandler('all', new RegExp('.*'), url, resolver);
        };
    }
    const standardGraphQLHandlers = {
        /**
         * Captures any GraphQL operation, regardless of its name, under the current scope.
         * @example
         * graphql.operation((req, res, ctx) => {
         *   return res(ctx.data({ name: 'John' }))
         * })
         * @see {@link https://mswjs.io/docs/api/graphql/operation `graphql.operation()`}
         */
        operation: createGraphQLOperationHandler('*'),
        /**
         * Captures a GraphQL query by a given name.
         * @example
         * graphql.query('GetUser', (req, res, ctx) => {
         *   return res(ctx.data({ user: { name: 'John' } }))
         * })
         * @see {@link https://mswjs.io/docs/api/graphql/query `graphql.query()`}
         */
        query: createScopedGraphQLHandler('query', '*'),
        /**
         * Captures a GraphQL mutation by a given name.
         * @example
         * graphql.mutation('SavePost', (req, res, ctx) => {
         *   return res(ctx.data({ post: { id: 'abc-123' } }))
         * })
         * @see {@link https://mswjs.io/docs/api/graphql/mutation `graphql.mutation()`}
         */
        mutation: createScopedGraphQLHandler('mutation', '*'),
    };
    function createGraphQLLink(url) {
        return {
            operation: createGraphQLOperationHandler(url),
            query: createScopedGraphQLHandler('query', url),
            mutation: createScopedGraphQLHandler('mutation', url),
        };
    }
    Object.assign(Object.assign({}, standardGraphQLHandlers), { link: createGraphQLLink });

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /**
     * Helpers.
     */
    var s = 1000;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;

    /**
     * Parse or format the given `val`.
     *
     * Options:
     *
     *  - `long` verbose formatting [false]
     *
     * @param {String|Number} val
     * @param {Object} [options]
     * @throws {Error} throw an error if val is not a non-empty string or a number
     * @return {String|Number}
     * @api public
     */

    var ms = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === 'string' && val.length > 0) {
        return parse$2(val);
      } else if (type === 'number' && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        'val is not a non-empty string or a valid number. val=' +
          JSON.stringify(val)
      );
    };

    /**
     * Parse the given `str` and return milliseconds.
     *
     * @param {String} str
     * @return {Number}
     * @api private
     */

    function parse$2(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || 'ms').toLowerCase();
      switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
          return n * y;
        case 'weeks':
        case 'week':
        case 'w':
          return n * w;
        case 'days':
        case 'day':
        case 'd':
          return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
          return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
          return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
          return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
          return n;
        default:
          return undefined;
      }
    }

    /**
     * Short format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + 'd';
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + 'h';
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + 'm';
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + 's';
      }
      return ms + 'ms';
    }

    /**
     * Long format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, 'day');
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, 'hour');
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, 'minute');
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, 'second');
      }
      return ms + ' ms';
    }

    /**
     * Pluralization helper.
     */

    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
    }

    /**
     * This is the common logic for both the Node.js and web browser
     * implementations of `debug()`.
     */

    function setup(env) {
    	createDebug.debug = createDebug;
    	createDebug.default = createDebug;
    	createDebug.coerce = coerce;
    	createDebug.disable = disable;
    	createDebug.enable = enable;
    	createDebug.enabled = enabled;
    	createDebug.humanize = ms;
    	createDebug.destroy = destroy;

    	Object.keys(env).forEach(key => {
    		createDebug[key] = env[key];
    	});

    	/**
    	* The currently active debug mode names, and names to skip.
    	*/

    	createDebug.names = [];
    	createDebug.skips = [];

    	/**
    	* Map of special "%n" handling functions, for the debug "format" argument.
    	*
    	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
    	*/
    	createDebug.formatters = {};

    	/**
    	* Selects a color for a debug namespace
    	* @param {String} namespace The namespace string for the for the debug instance to be colored
    	* @return {Number|String} An ANSI color code for the given namespace
    	* @api private
    	*/
    	function selectColor(namespace) {
    		let hash = 0;

    		for (let i = 0; i < namespace.length; i++) {
    			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
    			hash |= 0; // Convert to 32bit integer
    		}

    		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    	}
    	createDebug.selectColor = selectColor;

    	/**
    	* Create a debugger with the given `namespace`.
    	*
    	* @param {String} namespace
    	* @return {Function}
    	* @api public
    	*/
    	function createDebug(namespace) {
    		let prevTime;
    		let enableOverride = null;
    		let namespacesCache;
    		let enabledCache;

    		function debug(...args) {
    			// Disabled?
    			if (!debug.enabled) {
    				return;
    			}

    			const self = debug;

    			// Set `diff` timestamp
    			const curr = Number(new Date());
    			const ms = curr - (prevTime || curr);
    			self.diff = ms;
    			self.prev = prevTime;
    			self.curr = curr;
    			prevTime = curr;

    			args[0] = createDebug.coerce(args[0]);

    			if (typeof args[0] !== 'string') {
    				// Anything else let's inspect with %O
    				args.unshift('%O');
    			}

    			// Apply any `formatters` transformations
    			let index = 0;
    			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
    				// If we encounter an escaped % then don't increase the array index
    				if (match === '%%') {
    					return '%';
    				}
    				index++;
    				const formatter = createDebug.formatters[format];
    				if (typeof formatter === 'function') {
    					const val = args[index];
    					match = formatter.call(self, val);

    					// Now we need to remove `args[index]` since it's inlined in the `format`
    					args.splice(index, 1);
    					index--;
    				}
    				return match;
    			});

    			// Apply env-specific formatting (colors, etc.)
    			createDebug.formatArgs.call(self, args);

    			const logFn = self.log || createDebug.log;
    			logFn.apply(self, args);
    		}

    		debug.namespace = namespace;
    		debug.useColors = createDebug.useColors();
    		debug.color = createDebug.selectColor(namespace);
    		debug.extend = extend;
    		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

    		Object.defineProperty(debug, 'enabled', {
    			enumerable: true,
    			configurable: false,
    			get: () => {
    				if (enableOverride !== null) {
    					return enableOverride;
    				}
    				if (namespacesCache !== createDebug.namespaces) {
    					namespacesCache = createDebug.namespaces;
    					enabledCache = createDebug.enabled(namespace);
    				}

    				return enabledCache;
    			},
    			set: v => {
    				enableOverride = v;
    			}
    		});

    		// Env-specific initialization logic for debug instances
    		if (typeof createDebug.init === 'function') {
    			createDebug.init(debug);
    		}

    		return debug;
    	}

    	function extend(namespace, delimiter) {
    		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
    		newDebug.log = this.log;
    		return newDebug;
    	}

    	/**
    	* Enables a debug mode by namespaces. This can include modes
    	* separated by a colon and wildcards.
    	*
    	* @param {String} namespaces
    	* @api public
    	*/
    	function enable(namespaces) {
    		createDebug.save(namespaces);
    		createDebug.namespaces = namespaces;

    		createDebug.names = [];
    		createDebug.skips = [];

    		let i;
    		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    		const len = split.length;

    		for (i = 0; i < len; i++) {
    			if (!split[i]) {
    				// ignore empty strings
    				continue;
    			}

    			namespaces = split[i].replace(/\*/g, '.*?');

    			if (namespaces[0] === '-') {
    				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    			} else {
    				createDebug.names.push(new RegExp('^' + namespaces + '$'));
    			}
    		}
    	}

    	/**
    	* Disable debug output.
    	*
    	* @return {String} namespaces
    	* @api public
    	*/
    	function disable() {
    		const namespaces = [
    			...createDebug.names.map(toNamespace),
    			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
    		].join(',');
    		createDebug.enable('');
    		return namespaces;
    	}

    	/**
    	* Returns true if the given mode name is enabled, false otherwise.
    	*
    	* @param {String} name
    	* @return {Boolean}
    	* @api public
    	*/
    	function enabled(name) {
    		if (name[name.length - 1] === '*') {
    			return true;
    		}

    		let i;
    		let len;

    		for (i = 0, len = createDebug.skips.length; i < len; i++) {
    			if (createDebug.skips[i].test(name)) {
    				return false;
    			}
    		}

    		for (i = 0, len = createDebug.names.length; i < len; i++) {
    			if (createDebug.names[i].test(name)) {
    				return true;
    			}
    		}

    		return false;
    	}

    	/**
    	* Convert regexp to namespace
    	*
    	* @param {RegExp} regxep
    	* @return {String} namespace
    	* @api private
    	*/
    	function toNamespace(regexp) {
    		return regexp.toString()
    			.substring(2, regexp.toString().length - 2)
    			.replace(/\.\*\?$/, '*');
    	}

    	/**
    	* Coerce `val`.
    	*
    	* @param {Mixed} val
    	* @return {Mixed}
    	* @api private
    	*/
    	function coerce(val) {
    		if (val instanceof Error) {
    			return val.stack || val.message;
    		}
    		return val;
    	}

    	/**
    	* XXX DO NOT USE. This is a temporary stub function.
    	* XXX It WILL be removed in the next major release.
    	*/
    	function destroy() {
    		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
    	}

    	createDebug.enable(createDebug.load());

    	return createDebug;
    }

    var common = setup;

    /* eslint-env browser */

    var browser = createCommonjsModule(function (module, exports) {
    /**
     * This is the web browser implementation of `debug()`.
     */

    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = (() => {
    	let warned = false;

    	return () => {
    		if (!warned) {
    			warned = true;
    			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
    		}
    	};
    })();

    /**
     * Colors.
     */

    exports.colors = [
    	'#0000CC',
    	'#0000FF',
    	'#0033CC',
    	'#0033FF',
    	'#0066CC',
    	'#0066FF',
    	'#0099CC',
    	'#0099FF',
    	'#00CC00',
    	'#00CC33',
    	'#00CC66',
    	'#00CC99',
    	'#00CCCC',
    	'#00CCFF',
    	'#3300CC',
    	'#3300FF',
    	'#3333CC',
    	'#3333FF',
    	'#3366CC',
    	'#3366FF',
    	'#3399CC',
    	'#3399FF',
    	'#33CC00',
    	'#33CC33',
    	'#33CC66',
    	'#33CC99',
    	'#33CCCC',
    	'#33CCFF',
    	'#6600CC',
    	'#6600FF',
    	'#6633CC',
    	'#6633FF',
    	'#66CC00',
    	'#66CC33',
    	'#9900CC',
    	'#9900FF',
    	'#9933CC',
    	'#9933FF',
    	'#99CC00',
    	'#99CC33',
    	'#CC0000',
    	'#CC0033',
    	'#CC0066',
    	'#CC0099',
    	'#CC00CC',
    	'#CC00FF',
    	'#CC3300',
    	'#CC3333',
    	'#CC3366',
    	'#CC3399',
    	'#CC33CC',
    	'#CC33FF',
    	'#CC6600',
    	'#CC6633',
    	'#CC9900',
    	'#CC9933',
    	'#CCCC00',
    	'#CCCC33',
    	'#FF0000',
    	'#FF0033',
    	'#FF0066',
    	'#FF0099',
    	'#FF00CC',
    	'#FF00FF',
    	'#FF3300',
    	'#FF3333',
    	'#FF3366',
    	'#FF3399',
    	'#FF33CC',
    	'#FF33FF',
    	'#FF6600',
    	'#FF6633',
    	'#FF9900',
    	'#FF9933',
    	'#FFCC00',
    	'#FFCC33'
    ];

    /**
     * Currently only WebKit-based Web Inspectors, Firefox >= v31,
     * and the Firebug extension (any Firefox version) are known
     * to support "%c" CSS customizations.
     *
     * TODO: add a `localStorage` variable to explicitly enable/disable colors
     */

    // eslint-disable-next-line complexity
    function useColors() {
    	// NB: In an Electron preload script, document will be defined but not fully
    	// initialized. Since we know we're in Chrome, we'll just detect this case
    	// explicitly
    	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
    		return true;
    	}

    	// Internet Explorer and Edge do not support colors.
    	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    		return false;
    	}

    	// Is webkit? http://stackoverflow.com/a/16459606/376773
    	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    		// Is firebug? http://stackoverflow.com/a/398120/376773
    		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    		// Is firefox >= v31?
    		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    		// Double check webkit in userAgent just in case we are in a worker
    		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
    }

    /**
     * Colorize log arguments if enabled.
     *
     * @api public
     */

    function formatArgs(args) {
    	args[0] = (this.useColors ? '%c' : '') +
    		this.namespace +
    		(this.useColors ? ' %c' : ' ') +
    		args[0] +
    		(this.useColors ? '%c ' : ' ') +
    		'+' + module.exports.humanize(this.diff);

    	if (!this.useColors) {
    		return;
    	}

    	const c = 'color: ' + this.color;
    	args.splice(1, 0, c, 'color: inherit');

    	// The final "%c" is somewhat tricky, because there could be other
    	// arguments passed either before or after the %c, so we need to
    	// figure out the correct index to insert the CSS into
    	let index = 0;
    	let lastC = 0;
    	args[0].replace(/%[a-zA-Z%]/g, match => {
    		if (match === '%%') {
    			return;
    		}
    		index++;
    		if (match === '%c') {
    			// We only are interested in the *last* %c
    			// (the user may have provided their own)
    			lastC = index;
    		}
    	});

    	args.splice(lastC, 0, c);
    }

    /**
     * Invokes `console.debug()` when available.
     * No-op when `console.debug` is not a "function".
     * If `console.debug` is not available, falls back
     * to `console.log`.
     *
     * @api public
     */
    exports.log = console.debug || console.log || (() => {});

    /**
     * Save `namespaces`.
     *
     * @param {String} namespaces
     * @api private
     */
    function save(namespaces) {
    	try {
    		if (namespaces) {
    			exports.storage.setItem('debug', namespaces);
    		} else {
    			exports.storage.removeItem('debug');
    		}
    	} catch (error) {
    		// Swallow
    		// XXX (@Qix-) should we be logging these?
    	}
    }

    /**
     * Load `namespaces`.
     *
     * @return {String} returns the previously persisted debug modes
     * @api private
     */
    function load() {
    	let r;
    	try {
    		r = exports.storage.getItem('debug');
    	} catch (error) {
    		// Swallow
    		// XXX (@Qix-) should we be logging these?
    	}

    	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    	if (!r && typeof process !== 'undefined' && 'env' in process) {
    		r = process.env.DEBUG;
    	}

    	return r;
    }

    /**
     * Localstorage attempts to return the localstorage.
     *
     * This is necessary because safari throws
     * when a user disables cookies/localstorage
     * and you attempt to access it.
     *
     * @return {LocalStorage}
     * @api private
     */

    function localstorage() {
    	try {
    		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
    		// The Browser also has localStorage in the global context.
    		return localStorage;
    	} catch (error) {
    		// Swallow
    		// XXX (@Qix-) should we be logging these?
    	}
    }

    module.exports = common(exports);

    const {formatters} = module.exports;

    /**
     * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
     */

    formatters.j = function (v) {
    	try {
    		return JSON.stringify(v);
    	} catch (error) {
    		return '[UnexpectedJSONParseError]: ' + error.message;
    	}
    };
    });

    var lib$3 = {};

    var StrictEventEmitter$1 = {};

    var events = {exports: {}};

    var R = typeof Reflect === 'object' ? Reflect : null;
    var ReflectApply = R && typeof R.apply === 'function'
      ? R.apply
      : function ReflectApply(target, receiver, args) {
        return Function.prototype.apply.call(target, receiver, args);
      };

    var ReflectOwnKeys;
    if (R && typeof R.ownKeys === 'function') {
      ReflectOwnKeys = R.ownKeys;
    } else if (Object.getOwnPropertySymbols) {
      ReflectOwnKeys = function ReflectOwnKeys(target) {
        return Object.getOwnPropertyNames(target)
          .concat(Object.getOwnPropertySymbols(target));
      };
    } else {
      ReflectOwnKeys = function ReflectOwnKeys(target) {
        return Object.getOwnPropertyNames(target);
      };
    }

    function ProcessEmitWarning(warning) {
      if (console && console.warn) console.warn(warning);
    }

    var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
      return value !== value;
    };

    function EventEmitter() {
      EventEmitter.init.call(this);
    }
    events.exports = EventEmitter;
    events.exports.once = once;

    // Backwards-compat with node 0.10.x
    EventEmitter.EventEmitter = EventEmitter;

    EventEmitter.prototype._events = undefined;
    EventEmitter.prototype._eventsCount = 0;
    EventEmitter.prototype._maxListeners = undefined;

    // By default EventEmitters will print a warning if more than 10 listeners are
    // added to it. This is a useful default which helps finding memory leaks.
    var defaultMaxListeners = 10;

    function checkListener(listener) {
      if (typeof listener !== 'function') {
        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
      }
    }

    Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
      enumerable: true,
      get: function() {
        return defaultMaxListeners;
      },
      set: function(arg) {
        if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
          throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
        }
        defaultMaxListeners = arg;
      }
    });

    EventEmitter.init = function() {

      if (this._events === undefined ||
          this._events === Object.getPrototypeOf(this)._events) {
        this._events = Object.create(null);
        this._eventsCount = 0;
      }

      this._maxListeners = this._maxListeners || undefined;
    };

    // Obviously not all Emitters should be limited to 10. This function allows
    // that to be increased. Set to zero for unlimited.
    EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
      if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
        throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
      }
      this._maxListeners = n;
      return this;
    };

    function _getMaxListeners(that) {
      if (that._maxListeners === undefined)
        return EventEmitter.defaultMaxListeners;
      return that._maxListeners;
    }

    EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
      return _getMaxListeners(this);
    };

    EventEmitter.prototype.emit = function emit(type) {
      var args = [];
      for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
      var doError = (type === 'error');

      var events = this._events;
      if (events !== undefined)
        doError = (doError && events.error === undefined);
      else if (!doError)
        return false;

      // If there is no 'error' event listener then throw.
      if (doError) {
        var er;
        if (args.length > 0)
          er = args[0];
        if (er instanceof Error) {
          // Note: The comments on the `throw` lines are intentional, they show
          // up in Node's output if this results in an unhandled exception.
          throw er; // Unhandled 'error' event
        }
        // At least give some kind of context to the user
        var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
        err.context = er;
        throw err; // Unhandled 'error' event
      }

      var handler = events[type];

      if (handler === undefined)
        return false;

      if (typeof handler === 'function') {
        ReflectApply(handler, this, args);
      } else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          ReflectApply(listeners[i], this, args);
      }

      return true;
    };

    function _addListener(target, type, listener, prepend) {
      var m;
      var events;
      var existing;

      checkListener(listener);

      events = target._events;
      if (events === undefined) {
        events = target._events = Object.create(null);
        target._eventsCount = 0;
      } else {
        // To avoid recursion in the case that type === "newListener"! Before
        // adding it to the listeners, first emit "newListener".
        if (events.newListener !== undefined) {
          target.emit('newListener', type,
                      listener.listener ? listener.listener : listener);

          // Re-assign `events` because a newListener handler could have caused the
          // this._events to be assigned to a new object
          events = target._events;
        }
        existing = events[type];
      }

      if (existing === undefined) {
        // Optimize the case of one listener. Don't need the extra array object.
        existing = events[type] = listener;
        ++target._eventsCount;
      } else {
        if (typeof existing === 'function') {
          // Adding the second element, need to change to array.
          existing = events[type] =
            prepend ? [listener, existing] : [existing, listener];
          // If we've already got an array, just append.
        } else if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }

        // Check for listener leak
        m = _getMaxListeners(target);
        if (m > 0 && existing.length > m && !existing.warned) {
          existing.warned = true;
          // No error code for this since it is a Warning
          // eslint-disable-next-line no-restricted-syntax
          var w = new Error('Possible EventEmitter memory leak detected. ' +
                              existing.length + ' ' + String(type) + ' listeners ' +
                              'added. Use emitter.setMaxListeners() to ' +
                              'increase limit');
          w.name = 'MaxListenersExceededWarning';
          w.emitter = target;
          w.type = type;
          w.count = existing.length;
          ProcessEmitWarning(w);
        }
      }

      return target;
    }

    EventEmitter.prototype.addListener = function addListener(type, listener) {
      return _addListener(this, type, listener, false);
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.prependListener =
        function prependListener(type, listener) {
          return _addListener(this, type, listener, true);
        };

    function onceWrapper() {
      if (!this.fired) {
        this.target.removeListener(this.type, this.wrapFn);
        this.fired = true;
        if (arguments.length === 0)
          return this.listener.call(this.target);
        return this.listener.apply(this.target, arguments);
      }
    }

    function _onceWrap(target, type, listener) {
      var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
      var wrapped = onceWrapper.bind(state);
      wrapped.listener = listener;
      state.wrapFn = wrapped;
      return wrapped;
    }

    EventEmitter.prototype.once = function once(type, listener) {
      checkListener(listener);
      this.on(type, _onceWrap(this, type, listener));
      return this;
    };

    EventEmitter.prototype.prependOnceListener =
        function prependOnceListener(type, listener) {
          checkListener(listener);
          this.prependListener(type, _onceWrap(this, type, listener));
          return this;
        };

    // Emits a 'removeListener' event if and only if the listener was removed.
    EventEmitter.prototype.removeListener =
        function removeListener(type, listener) {
          var list, events, position, i, originalListener;

          checkListener(listener);

          events = this._events;
          if (events === undefined)
            return this;

          list = events[type];
          if (list === undefined)
            return this;

          if (list === listener || list.listener === listener) {
            if (--this._eventsCount === 0)
              this._events = Object.create(null);
            else {
              delete events[type];
              if (events.removeListener)
                this.emit('removeListener', type, list.listener || listener);
            }
          } else if (typeof list !== 'function') {
            position = -1;

            for (i = list.length - 1; i >= 0; i--) {
              if (list[i] === listener || list[i].listener === listener) {
                originalListener = list[i].listener;
                position = i;
                break;
              }
            }

            if (position < 0)
              return this;

            if (position === 0)
              list.shift();
            else {
              spliceOne(list, position);
            }

            if (list.length === 1)
              events[type] = list[0];

            if (events.removeListener !== undefined)
              this.emit('removeListener', type, originalListener || listener);
          }

          return this;
        };

    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

    EventEmitter.prototype.removeAllListeners =
        function removeAllListeners(type) {
          var listeners, events, i;

          events = this._events;
          if (events === undefined)
            return this;

          // not listening for removeListener, no need to emit
          if (events.removeListener === undefined) {
            if (arguments.length === 0) {
              this._events = Object.create(null);
              this._eventsCount = 0;
            } else if (events[type] !== undefined) {
              if (--this._eventsCount === 0)
                this._events = Object.create(null);
              else
                delete events[type];
            }
            return this;
          }

          // emit removeListener for all listeners on all events
          if (arguments.length === 0) {
            var keys = Object.keys(events);
            var key;
            for (i = 0; i < keys.length; ++i) {
              key = keys[i];
              if (key === 'removeListener') continue;
              this.removeAllListeners(key);
            }
            this.removeAllListeners('removeListener');
            this._events = Object.create(null);
            this._eventsCount = 0;
            return this;
          }

          listeners = events[type];

          if (typeof listeners === 'function') {
            this.removeListener(type, listeners);
          } else if (listeners !== undefined) {
            // LIFO order
            for (i = listeners.length - 1; i >= 0; i--) {
              this.removeListener(type, listeners[i]);
            }
          }

          return this;
        };

    function _listeners(target, type, unwrap) {
      var events = target._events;

      if (events === undefined)
        return [];

      var evlistener = events[type];
      if (evlistener === undefined)
        return [];

      if (typeof evlistener === 'function')
        return unwrap ? [evlistener.listener || evlistener] : [evlistener];

      return unwrap ?
        unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
    }

    EventEmitter.prototype.listeners = function listeners(type) {
      return _listeners(this, type, true);
    };

    EventEmitter.prototype.rawListeners = function rawListeners(type) {
      return _listeners(this, type, false);
    };

    EventEmitter.listenerCount = function(emitter, type) {
      if (typeof emitter.listenerCount === 'function') {
        return emitter.listenerCount(type);
      } else {
        return listenerCount.call(emitter, type);
      }
    };

    EventEmitter.prototype.listenerCount = listenerCount;
    function listenerCount(type) {
      var events = this._events;

      if (events !== undefined) {
        var evlistener = events[type];

        if (typeof evlistener === 'function') {
          return 1;
        } else if (evlistener !== undefined) {
          return evlistener.length;
        }
      }

      return 0;
    }

    EventEmitter.prototype.eventNames = function eventNames() {
      return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
    };

    function arrayClone(arr, n) {
      var copy = new Array(n);
      for (var i = 0; i < n; ++i)
        copy[i] = arr[i];
      return copy;
    }

    function spliceOne(list, index) {
      for (; index + 1 < list.length; index++)
        list[index] = list[index + 1];
      list.pop();
    }

    function unwrapListeners(arr) {
      var ret = new Array(arr.length);
      for (var i = 0; i < ret.length; ++i) {
        ret[i] = arr[i].listener || arr[i];
      }
      return ret;
    }

    function once(emitter, name) {
      return new Promise(function (resolve, reject) {
        function errorListener(err) {
          emitter.removeListener(name, resolver);
          reject(err);
        }

        function resolver() {
          if (typeof emitter.removeListener === 'function') {
            emitter.removeListener('error', errorListener);
          }
          resolve([].slice.call(arguments));
        }
        eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
        if (name !== 'error') {
          addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
        }
      });
    }

    function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
      if (typeof emitter.on === 'function') {
        eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
      }
    }

    function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
      if (typeof emitter.on === 'function') {
        if (flags.once) {
          emitter.once(name, listener);
        } else {
          emitter.on(name, listener);
        }
      } else if (typeof emitter.addEventListener === 'function') {
        // EventTarget does not have `error` event semantics like Node
        // EventEmitters, we do not listen for `error` events here.
        emitter.addEventListener(name, function wrapListener(arg) {
          // IE does not have builtin `{ once: true }` support so we
          // have to do it manually.
          if (flags.once) {
            emitter.removeEventListener(name, wrapListener);
          }
          listener(arg);
        });
      } else {
        throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
      }
    }

    var __extends$1 = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __spreadArrays = (commonjsGlobal && commonjsGlobal.__spreadArrays) || function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };
    StrictEventEmitter$1.__esModule = true;
    StrictEventEmitter$1.StrictEventEmitter = void 0;
    var events_1 = events.exports;
    var StrictEventEmitter = /** @class */ (function (_super) {
        __extends$1(StrictEventEmitter, _super);
        function StrictEventEmitter() {
            return _super.call(this) || this;
        }
        StrictEventEmitter.prototype.on = function (event, listener) {
            return _super.prototype.on.call(this, event.toString(), listener);
        };
        StrictEventEmitter.prototype.once = function (event, listener) {
            return _super.prototype.on.call(this, event.toString(), listener);
        };
        StrictEventEmitter.prototype.off = function (event, listener) {
            return _super.prototype.off.call(this, event.toString(), listener);
        };
        StrictEventEmitter.prototype.emit = function (event) {
            var data = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                data[_i - 1] = arguments[_i];
            }
            return _super.prototype.emit.apply(this, __spreadArrays([event.toString()], data));
        };
        StrictEventEmitter.prototype.addListener = function (event, listener) {
            return _super.prototype.addListener.call(this, event.toString(), listener);
        };
        StrictEventEmitter.prototype.removeListener = function (event, listener) {
            return _super.prototype.removeListener.call(this, event.toString(), listener);
        };
        return StrictEventEmitter;
    }(events_1.EventEmitter));
    StrictEventEmitter$1.StrictEventEmitter = StrictEventEmitter;

    (function (exports) {
    var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
    }) : (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }));
    exports.__esModule = true;
    exports.StrictEventEmitter = void 0;
    var StrictEventEmitter_1 = StrictEventEmitter$1;
    __createBinding(exports, StrictEventEmitter_1, "StrictEventEmitter");
    }(lib$3));

    var lib$2 = {};

    var until$1 = {};

    Object.defineProperty(until$1, "__esModule", { value: true });
    /**
     * Gracefully handles a given Promise factory.
     * @example
     * cosnt [error, data] = await until(() => asyncAction())
     */
    until$1.until = async (promise) => {
        try {
            const data = await promise().catch((error) => {
                throw error;
            });
            return [null, data];
        }
        catch (error) {
            return [error, null];
        }
    };

    Object.defineProperty(lib$2, "__esModule", { value: true });
    var until_1$1 = until$1;
    var until = lib$2.until = until_1$1.until;

    /**
     * Attempts to resolve a Service Worker instance from a given registration,
     * regardless of its state (active, installing, waiting).
     */
    const getWorkerByRegistration = (registration, absoluteWorkerUrl, findWorker) => {
        const allStates = [
            registration.active,
            registration.installing,
            registration.waiting,
        ];
        const existingStates = allStates.filter(Boolean);
        const mockWorker = existingStates.find((worker) => {
            return findWorker(worker.scriptURL, absoluteWorkerUrl);
        });
        return mockWorker || null;
    };

    /**
     * Returns an absolute Service Worker URL based on the given
     * relative URL (known during the registration).
     */
    function getAbsoluteWorkerUrl(relativeUrl) {
        return new URL(relativeUrl, location.origin).href;
    }

    /**
     * Returns an active Service Worker instance.
     * When not found, registers a new Service Worker.
     */
    const getWorkerInstance = (url, options = {}, findWorker) => __awaiter$3(void 0, void 0, void 0, function* () {
        // Resolve the absolute Service Worker URL.
        const absoluteWorkerUrl = getAbsoluteWorkerUrl(url);
        const mockRegistrations = yield navigator.serviceWorker
            .getRegistrations()
            .then((registrations) => registrations.filter((registration) => getWorkerByRegistration(registration, absoluteWorkerUrl, findWorker)));
        if (!navigator.serviceWorker.controller && mockRegistrations.length > 0) {
            // Reload the page when it has associated workers, but no active controller.
            // The absence of a controller can mean either:
            // - page has no Service Worker associated with it
            // - page has been hard-reloaded and its workers won't be used until the next reload.
            // Since we've checked that there are registrations associated with this page,
            // at this point we are sure it's hard reload that falls into this clause.
            location.reload();
        }
        const [existingRegistration] = mockRegistrations;
        if (existingRegistration) {
            // When the Service Worker is registered, update it and return the reference.
            return existingRegistration.update().then(() => {
                return [
                    getWorkerByRegistration(existingRegistration, absoluteWorkerUrl, findWorker),
                    existingRegistration,
                ];
            });
        }
        // When the Service Worker wasn't found, register it anew and return the reference.
        const [error, instance] = yield until(() => __awaiter$3(void 0, void 0, void 0, function* () {
            const registration = yield navigator.serviceWorker.register(url, options);
            return [
                // Compare existing worker registration by its worker URL,
                // to prevent irrelevant workers to resolve here (such as Codesandbox worker).
                getWorkerByRegistration(registration, absoluteWorkerUrl, findWorker),
                registration,
            ];
        }));
        // Handle Service Worker registration errors.
        if (error) {
            const isWorkerMissing = error.message.includes('(404)');
            // Produce a custom error message when given a non-existing Service Worker url.
            // Suggest developers to check their setup.
            if (isWorkerMissing) {
                const scopeUrl = new URL((options === null || options === void 0 ? void 0 : options.scope) || '/', location.href);
                throw new Error(devUtils.formatMessage(`\
Failed to register a Service Worker for scope ('${scopeUrl.href}') with script ('${absoluteWorkerUrl}'): Service Worker script does not exist at the given path.

Did you forget to run "npx msw init <PUBLIC_DIR>"?

Learn more about creating the Service Worker script: https://mswjs.io/docs/cli/init`));
            }
            // Fallback error message for any other registration errors.
            throw new Error(devUtils.formatMessage('Failed to register the Service Worker:\n\n%s', error.message));
        }
        return instance;
    });

    /**
     * Prints a worker activation message in the browser's console.
     */
    function printStartMessage(args = {}) {
        if (args.quiet) {
            return;
        }
        const message = args.message || 'Mocking enabled.';
        console.groupCollapsed(`%c${devUtils.formatMessage(message)}`, 'color:orangered;font-weight:bold;');
        console.log('%cDocumentation: %chttps://mswjs.io/docs', 'font-weight:bold', 'font-weight:normal');
        console.log('Found an issue? https://github.com/mswjs/msw/issues');
        console.groupEnd();
    }

    /**
     * Signals the worker to enable the interception of requests.
     */
    function enableMocking(context, options) {
        return __awaiter$3(this, void 0, void 0, function* () {
            context.workerChannel.send('MOCK_ACTIVATE');
            return context.events.once('MOCKING_ENABLED').then(() => {
                printStartMessage({ quiet: options.quiet });
            });
        });
    }

    /**
     * Creates a communication channel between the client
     * and the Service Worker associated with the given event.
     */
    const createBroadcastChannel = (event) => {
        const port = event.ports[0];
        return {
            /**
             * Sends a text message to the connected Service Worker.
             */
            send(message) {
                if (port) {
                    port.postMessage(message);
                }
            },
        };
    };

    var lib$1 = {};

    var CookieStore = {};

    var setCookie = {exports: {}};

    var defaultParseOptions = {
      decodeValues: true,
      map: false,
      silent: false,
    };

    function isNonEmptyString(str) {
      return typeof str === "string" && !!str.trim();
    }

    function parseString(setCookieValue, options) {
      var parts = setCookieValue.split(";").filter(isNonEmptyString);
      var nameValue = parts.shift().split("=");
      var name = nameValue.shift();
      var value = nameValue.join("="); // everything after the first =, joined by a "=" if there was more than one part

      options = options
        ? Object.assign({}, defaultParseOptions, options)
        : defaultParseOptions;

      try {
        value = options.decodeValues ? decodeURIComponent(value) : value; // decode cookie value
      } catch (e) {
        console.error(
          "set-cookie-parser encountered an error while decoding a cookie with value '" +
            value +
            "'. Set options.decodeValues to false to disable this feature.",
          e
        );
      }

      var cookie = {
        name: name, // grab everything before the first =
        value: value,
      };

      parts.forEach(function (part) {
        var sides = part.split("=");
        var key = sides.shift().trimLeft().toLowerCase();
        var value = sides.join("=");
        if (key === "expires") {
          cookie.expires = new Date(value);
        } else if (key === "max-age") {
          cookie.maxAge = parseInt(value, 10);
        } else if (key === "secure") {
          cookie.secure = true;
        } else if (key === "httponly") {
          cookie.httpOnly = true;
        } else if (key === "samesite") {
          cookie.sameSite = value;
        } else {
          cookie[key] = value;
        }
      });

      return cookie;
    }

    function parse$1(input, options) {
      options = options
        ? Object.assign({}, defaultParseOptions, options)
        : defaultParseOptions;

      if (!input) {
        if (!options.map) {
          return [];
        } else {
          return {};
        }
      }

      if (input.headers && input.headers["set-cookie"]) {
        // fast-path for node.js (which automatically normalizes header names to lower-case
        input = input.headers["set-cookie"];
      } else if (input.headers) {
        // slow-path for other environments - see #25
        var sch =
          input.headers[
            Object.keys(input.headers).find(function (key) {
              return key.toLowerCase() === "set-cookie";
            })
          ];
        // warn if called on a request-like object with a cookie header rather than a set-cookie header - see #34, 36
        if (!sch && input.headers.cookie && !options.silent) {
          console.warn(
            "Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning."
          );
        }
        input = sch;
      }
      if (!Array.isArray(input)) {
        input = [input];
      }

      options = options
        ? Object.assign({}, defaultParseOptions, options)
        : defaultParseOptions;

      if (!options.map) {
        return input.filter(isNonEmptyString).map(function (str) {
          return parseString(str, options);
        });
      } else {
        var cookies = {};
        return input.filter(isNonEmptyString).reduce(function (cookies, str) {
          var cookie = parseString(str, options);
          cookies[cookie.name] = cookie;
          return cookies;
        }, cookies);
      }
    }

    /*
      Set-Cookie header field-values are sometimes comma joined in one string. This splits them without choking on commas
      that are within a single set-cookie field-value, such as in the Expires portion.

      This is uncommon, but explicitly allowed - see https://tools.ietf.org/html/rfc2616#section-4.2
      Node.js does this for every header *except* set-cookie - see https://github.com/nodejs/node/blob/d5e363b77ebaf1caf67cd7528224b651c86815c1/lib/_http_incoming.js#L128
      React Native's fetch does this for *every* header, including set-cookie.

      Based on: https://github.com/google/j2objc/commit/16820fdbc8f76ca0c33472810ce0cb03d20efe25
      Credits to: https://github.com/tomball for original and https://github.com/chrusart for JavaScript implementation
    */
    function splitCookiesString(cookiesString) {
      if (Array.isArray(cookiesString)) {
        return cookiesString;
      }
      if (typeof cookiesString !== "string") {
        return [];
      }

      var cookiesStrings = [];
      var pos = 0;
      var start;
      var ch;
      var lastComma;
      var nextStart;
      var cookiesSeparatorFound;

      function skipWhitespace() {
        while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
          pos += 1;
        }
        return pos < cookiesString.length;
      }

      function notSpecialChar() {
        ch = cookiesString.charAt(pos);

        return ch !== "=" && ch !== ";" && ch !== ",";
      }

      while (pos < cookiesString.length) {
        start = pos;
        cookiesSeparatorFound = false;

        while (skipWhitespace()) {
          ch = cookiesString.charAt(pos);
          if (ch === ",") {
            // ',' is a cookie separator if we have later first '=', not ';' or ','
            lastComma = pos;
            pos += 1;

            skipWhitespace();
            nextStart = pos;

            while (pos < cookiesString.length && notSpecialChar()) {
              pos += 1;
            }

            // currently special character
            if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
              // we found cookies separator
              cookiesSeparatorFound = true;
              // pos is inside the next cookie, so back up and return it.
              pos = nextStart;
              cookiesStrings.push(cookiesString.substring(start, lastComma));
              start = pos;
            } else {
              // in param ',' or param separator ';',
              // we continue from that comma
              pos = lastComma + 1;
            }
          } else {
            pos += 1;
          }
        }

        if (!cookiesSeparatorFound || pos >= cookiesString.length) {
          cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
        }
      }

      return cookiesStrings;
    }

    setCookie.exports = parse$1;
    setCookie.exports.parse = parse$1;
    setCookie.exports.parseString = parseString;
    setCookie.exports.splitCookiesString = splitCookiesString;

    (function (exports) {
    var __rest = (commonjsGlobal && commonjsGlobal.__rest) || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PERSISTENCY_KEY = void 0;
    const set_cookie_parser_1 = setCookie.exports;
    exports.PERSISTENCY_KEY = 'MSW_COOKIE_STORE';
    const SUPPORTS_LOCAL_STORAGE = typeof localStorage !== 'undefined';
    class CookieStore {
        constructor() {
            this.store = new Map();
        }
        /**
         * Sets the given request cookies into the store.
         * Respects the `request.credentials` policy.
         */
        add(request, response) {
            if (request.credentials === 'omit') {
                return;
            }
            const requestUrl = new URL(request.url);
            const responseCookies = response.headers.get('set-cookie');
            if (!responseCookies) {
                return;
            }
            const now = Date.now();
            const parsedResponseCookies = set_cookie_parser_1.parse(responseCookies).map((_a) => {
                var { maxAge } = _a, cookie = __rest(_a, ["maxAge"]);
                return (Object.assign(Object.assign({}, cookie), { expires: maxAge === undefined ? cookie.expires : new Date(now + maxAge * 1000), maxAge }));
            });
            const prevCookies = this.store.get(requestUrl.origin) || new Map();
            parsedResponseCookies.forEach((cookie) => {
                this.store.set(requestUrl.origin, prevCookies.set(cookie.name, cookie));
            });
        }
        /**
         * Returns cookies relevant to the given request
         * and its `request.credentials` policy.
         */
        get(request) {
            this.deleteExpiredCookies();
            const requestUrl = new URL(request.url);
            const originCookies = this.store.get(requestUrl.origin) || new Map();
            switch (request.credentials) {
                case 'include': {
                    const documentCookies = set_cookie_parser_1.parse(document.cookie);
                    documentCookies.forEach((cookie) => {
                        originCookies.set(cookie.name, cookie);
                    });
                    return originCookies;
                }
                case 'same-origin': {
                    return originCookies;
                }
                default:
                    return new Map();
            }
        }
        /**
         * Returns a collection of all stored cookies.
         */
        getAll() {
            this.deleteExpiredCookies();
            return this.store;
        }
        /**
         * Deletes all cookies associated with the given request.
         */
        deleteAll(request) {
            const requestUrl = new URL(request.url);
            this.store.delete(requestUrl.origin);
        }
        /**
         * Clears the entire cookie store.
         */
        clear() {
            this.store.clear();
        }
        /**
         * Hydrates the virtual cookie store from the `localStorage` if defined.
         */
        hydrate() {
            if (!SUPPORTS_LOCAL_STORAGE) {
                return;
            }
            const persistedCookies = localStorage.getItem(exports.PERSISTENCY_KEY);
            if (persistedCookies) {
                try {
                    const parsedCookies = JSON.parse(persistedCookies);
                    parsedCookies.forEach(([origin, cookies]) => {
                        this.store.set(origin, new Map(cookies.map((_a) => {
                            var [token, _b] = _a, { expires } = _b, cookie = __rest(_b, ["expires"]);
                            return [
                                token,
                                expires === undefined
                                    ? cookie
                                    : Object.assign(Object.assign({}, cookie), { expires: new Date(expires) }),
                            ];
                        })));
                    });
                }
                catch (error) {
                    console.warn(`
[virtual-cookie] Failed to parse a stored cookie from the localStorage (key "${exports.PERSISTENCY_KEY}").

Stored value:
${localStorage.getItem(exports.PERSISTENCY_KEY)}

Thrown exception:
${error}

Invalid value has been removed from localStorage to prevent subsequent failed parsing attempts.`);
                    localStorage.removeItem(exports.PERSISTENCY_KEY);
                }
            }
        }
        /**
         * Persists the current virtual cookies into the `localStorage` if defined,
         * so they are available on the next page load.
         */
        persist() {
            if (!SUPPORTS_LOCAL_STORAGE) {
                return;
            }
            const serializedCookies = Array.from(this.store.entries()).map(([origin, cookies]) => {
                return [origin, Array.from(cookies.entries())];
            });
            localStorage.setItem(exports.PERSISTENCY_KEY, JSON.stringify(serializedCookies));
        }
        deleteExpiredCookies() {
            const now = Date.now();
            this.store.forEach((originCookies, origin) => {
                originCookies.forEach(({ expires, name }) => {
                    if (expires !== undefined && expires.getTime() <= now) {
                        originCookies.delete(name);
                    }
                });
                if (originCookies.size === 0) {
                    this.store.delete(origin);
                }
            });
        }
    }
    exports.default = new CookieStore();
    }(CookieStore));

    (function (exports) {
    var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PERSISTENCY_KEY = exports.store = void 0;
    var CookieStore_1 = CookieStore;
    Object.defineProperty(exports, "store", { enumerable: true, get: function () { return __importDefault(CookieStore_1).default; } });
    Object.defineProperty(exports, "PERSISTENCY_KEY", { enumerable: true, get: function () { return CookieStore_1.PERSISTENCY_KEY; } });
    }(lib$1));

    function getAllCookies() {
        return parse_1(document.cookie);
    }
    /**
     * Returns relevant document cookies based on the request `credentials` option.
     */
    function getRequestCookies(request) {
        /**
         * @note No cookies persist on the document in Node.js: no document.
         */
        if (typeof location === 'undefined') {
            return {};
        }
        switch (request.credentials) {
            case 'same-origin': {
                // Return document cookies only when requested a resource
                // from the same origin as the current document.
                return location.origin === request.url.origin ? getAllCookies() : {};
            }
            case 'include': {
                // Return all document cookies.
                return getAllCookies();
            }
            default: {
                return {};
            }
        }
    }

    function setRequestCookies(request) {
        var _a;
        lib$1.store.hydrate();
        request.cookies = Object.assign(Object.assign({}, getRequestCookies(request)), Array.from((_a = lib$1.store.get(Object.assign(Object.assign({}, request), { url: request.url.toString() }))) === null || _a === void 0 ? void 0 : _a.entries()).reduce((cookies, [name, { value }]) => Object.assign(cookies, { [name]: value }), {}));
        request.headers.set('cookie', Object.entries(request.cookies)
            .map(([name, value]) => `${name}=${value}`)
            .join('; '));
    }

    /**
     * Ensures that an empty GET request body is always represented as `undefined`.
     */
    function pruneGetRequestBody(request) {
        if (request.method &&
            isStringEqual(request.method, 'GET') &&
            request.body === '') {
            return undefined;
        }
        return request.body;
    }

    /**
     * Converts a given request received from the Service Worker
     * into a `MockedRequest` instance.
     */
    function parseWorkerRequest(rawRequest) {
        const request = {
            id: rawRequest.id,
            cache: rawRequest.cache,
            credentials: rawRequest.credentials,
            method: rawRequest.method,
            url: new URL(rawRequest.url),
            referrer: rawRequest.referrer,
            referrerPolicy: rawRequest.referrerPolicy,
            redirect: rawRequest.redirect,
            mode: rawRequest.mode,
            params: {},
            cookies: {},
            integrity: rawRequest.integrity,
            keepalive: rawRequest.keepalive,
            destination: rawRequest.destination,
            body: pruneGetRequestBody(rawRequest),
            bodyUsed: rawRequest.bodyUsed,
            headers: new lib$1$1.Headers(rawRequest.headers),
        };
        // Set document cookies on the request.
        setRequestCookies(request);
        // Parse the request's body based on the "Content-Type" header.
        request.body = parseBody(request.body, request.headers);
        return request;
    }

    /**
     * Returns a mocked response for a given request using following request handlers.
     */
    const getResponse = (request, handlers, resolutionContext) => __awaiter$3(void 0, void 0, void 0, function* () {
        const relevantHandlers = handlers.filter((handler) => {
            return handler.test(request, resolutionContext);
        });
        if (relevantHandlers.length === 0) {
            return {
                handler: undefined,
                response: undefined,
            };
        }
        const result = yield relevantHandlers.reduce((executionResult, handler) => __awaiter$3(void 0, void 0, void 0, function* () {
            const previousResults = yield executionResult;
            if (!!(previousResults === null || previousResults === void 0 ? void 0 : previousResults.response)) {
                return executionResult;
            }
            const result = yield handler.run(request, resolutionContext);
            if (result === null || result.handler.shouldSkip) {
                return null;
            }
            if (!result.response) {
                return {
                    request: result.request,
                    handler: result.handler,
                    response: undefined,
                    parsedResult: result.parsedResult,
                };
            }
            if (result.response.once) {
                handler.markAsSkipped(true);
            }
            return result;
        }), Promise.resolve(null));
        // Although reducing a list of relevant request handlers, it's possible
        // that in the end there will be no handler associted with the request
        // (i.e. if relevant handlers are fall-through).
        if (!result) {
            return {
                handler: undefined,
                response: undefined,
            };
        }
        return {
            handler: result.handler,
            publicRequest: result.request,
            parsedRequest: result.parsedResult,
            response: result.response,
        };
    });

    var jsLevenshtein = (function()
    {
      function _min(d0, d1, d2, bx, ay)
      {
        return d0 < d1 || d2 < d1
            ? d0 > d2
                ? d2 + 1
                : d0 + 1
            : bx === ay
                ? d1
                : d1 + 1;
      }

      return function(a, b)
      {
        if (a === b) {
          return 0;
        }

        if (a.length > b.length) {
          var tmp = a;
          a = b;
          b = tmp;
        }

        var la = a.length;
        var lb = b.length;

        while (la > 0 && (a.charCodeAt(la - 1) === b.charCodeAt(lb - 1))) {
          la--;
          lb--;
        }

        var offset = 0;

        while (offset < la && (a.charCodeAt(offset) === b.charCodeAt(offset))) {
          offset++;
        }

        la -= offset;
        lb -= offset;

        if (la === 0 || lb < 3) {
          return lb;
        }

        var x = 0;
        var y;
        var d0;
        var d1;
        var d2;
        var d3;
        var dd;
        var dy;
        var ay;
        var bx0;
        var bx1;
        var bx2;
        var bx3;

        var vector = [];

        for (y = 0; y < la; y++) {
          vector.push(y + 1);
          vector.push(a.charCodeAt(offset + y));
        }

        var len = vector.length - 1;

        for (; x < lb - 3;) {
          bx0 = b.charCodeAt(offset + (d0 = x));
          bx1 = b.charCodeAt(offset + (d1 = x + 1));
          bx2 = b.charCodeAt(offset + (d2 = x + 2));
          bx3 = b.charCodeAt(offset + (d3 = x + 3));
          dd = (x += 4);
          for (y = 0; y < len; y += 2) {
            dy = vector[y];
            ay = vector[y + 1];
            d0 = _min(dy, d0, d1, bx0, ay);
            d1 = _min(d0, d1, d2, bx1, ay);
            d2 = _min(d1, d2, d3, bx2, ay);
            dd = _min(d2, d3, dd, bx3, ay);
            vector[y] = dd;
            d3 = d2;
            d2 = d1;
            d1 = d0;
            d0 = dy;
          }
        }

        for (; x < lb;) {
          bx0 = b.charCodeAt(offset + (d0 = x));
          dd = ++x;
          for (y = 0; y < len; y += 2) {
            dy = vector[y];
            vector[y] = dd = _min(dy, d0, dd, bx0, vector[y + 1]);
            d0 = dy;
          }
        }

        return dd;
      };
    })();

    const MAX_MATCH_SCORE = 3;
    const MAX_SUGGESTION_COUNT = 4;
    const TYPE_MATCH_DELTA = 0.5;
    function groupHandlersByType(handlers) {
        return handlers.reduce((groups, handler) => {
            if (handler instanceof RestHandler) {
                groups.rest.push(handler);
            }
            if (handler instanceof GraphQLHandler) {
                groups.graphql.push(handler);
            }
            return groups;
        }, {
            rest: [],
            graphql: [],
        });
    }
    function getScoreForRestHandler() {
        return (request, handler) => {
            const { path, method } = handler.info;
            if (path instanceof RegExp) {
                return Infinity;
            }
            const hasSameMethod = isStringEqual(request.method, method);
            // Always treat a handler with the same method as a more similar one.
            const methodScoreDelta = hasSameMethod ? TYPE_MATCH_DELTA : 0;
            const requestPublicUrl = getPublicUrlFromRequest(request);
            const score = jsLevenshtein(requestPublicUrl, path);
            return score - methodScoreDelta;
        };
    }
    function getScoreForGraphQLHandler(parsedQuery) {
        return (_, handler) => {
            if (typeof parsedQuery.operationName === 'undefined') {
                return Infinity;
            }
            const { operationType, operationName } = handler.info;
            const hasSameOperationType = parsedQuery.operationType === operationType;
            // Always treat a handler with the same operation type as a more similar one.
            const operationTypeScoreDelta = hasSameOperationType ? TYPE_MATCH_DELTA : 0;
            const score = jsLevenshtein(parsedQuery.operationName, operationName);
            return score - operationTypeScoreDelta;
        };
    }
    function getSuggestedHandler(request, handlers, getScore) {
        const suggestedHandlers = handlers
            .reduce((acc, handler) => {
            const score = getScore(request, handler);
            return acc.concat([[score, handler]]);
        }, [])
            .sort(([leftScore], [rightScore]) => {
            return leftScore - rightScore;
        })
            .filter(([score]) => {
            return score <= MAX_MATCH_SCORE;
        })
            .slice(0, MAX_SUGGESTION_COUNT)
            .map(([, handler]) => handler);
        return suggestedHandlers;
    }
    function getSuggestedHandlersMessage(handlers) {
        if (handlers.length > 1) {
            return `\
Did you mean to request one of the following resources instead?

${handlers.map((handler) => `  • ${handler.info.header}`).join('\n')}`;
        }
        return `Did you mean to request "${handlers[0].info.header}" instead?`;
    }
    function onUnhandledRequest(request, handlers, strategy = 'warn') {
        if (typeof strategy === 'function') {
            strategy(request);
            return;
        }
        /**
         * @note Ignore exceptions during GraphQL request parsing because at this point
         * we cannot assume the unhandled request is a valid GraphQL request.
         * If the GraphQL parsing fails, just don't treat it as a GraphQL request.
         */
        const parsedGraphQLQuery = tryCatch(() => parseGraphQLRequest(request));
        const handlerGroups = groupHandlersByType(handlers);
        const relevantHandlers = parsedGraphQLQuery
            ? handlerGroups.graphql
            : handlerGroups.rest;
        const suggestedHandlers = getSuggestedHandler(request, relevantHandlers, parsedGraphQLQuery
            ? getScoreForGraphQLHandler(parsedGraphQLQuery)
            : getScoreForRestHandler());
        const handlerSuggestion = suggestedHandlers.length > 0
            ? getSuggestedHandlersMessage(suggestedHandlers)
            : '';
        const publicUrl = getPublicUrlFromRequest(request);
        const requestHeader = parsedGraphQLQuery
            ? `${parsedGraphQLQuery.operationType} ${parsedGraphQLQuery.operationName} (${request.method} ${publicUrl})`
            : `${request.method} ${publicUrl}`;
        const messageTemplate = [
            `captured a request without a matching request handler:`,
            `  \u2022 ${requestHeader}`,
            handlerSuggestion,
            `\
If you still wish to intercept this unhandled request, please create a request handler for it.
Read more: https://mswjs.io/docs/getting-started/mocks\
`,
        ].filter(Boolean);
        const message = messageTemplate.join('\n\n');
        switch (strategy) {
            case 'error': {
                // Print a developer-friendly error.
                devUtils.error('Error: %s', message);
                // Throw an exception to halt request processing and not perform the original request.
                throw new Error('Cannot bypass a request when using the "error" strategy for the "onUnhandledRequest" option.');
            }
            case 'warn': {
                devUtils.warn('Warning: %s', message);
                break;
            }
            case 'bypass':
                break;
            default:
                throw new Error(devUtils.formatMessage('Failed to react to an unhandled request: unknown strategy "%s". Please provide one of the supported strategies ("bypass", "warn", "error") or a custom callback function as the value of the "onUnhandledRequest" option.', strategy));
        }
    }

    function readResponseCookies(request, response) {
        lib$1.store.add(Object.assign(Object.assign({}, request), { url: request.url.toString() }), response);
        lib$1.store.persist();
    }

    function handleRequest(request, handlers, options, emitter, handleRequestOptions) {
        var _a, _b, _c;
        return __awaiter$3(this, void 0, void 0, function* () {
            emitter.emit('request:start', request);
            // Perform bypassed requests (i.e. issued via "ctx.fetch") as-is.
            if (request.headers.get('x-msw-bypass')) {
                emitter.emit('request:end', request);
                (_a = handleRequestOptions === null || handleRequestOptions === void 0 ? void 0 : handleRequestOptions.onBypassResponse) === null || _a === void 0 ? void 0 : _a.call(handleRequestOptions, request);
                return;
            }
            // Resolve a mocked response from the list of request handlers.
            const lookupResult = yield getResponse(request, handlers, handleRequestOptions === null || handleRequestOptions === void 0 ? void 0 : handleRequestOptions.resolutionContext);
            const { handler, response } = lookupResult;
            // When there's no handler for the request, consider it unhandled.
            // Allow the developer to react to such cases.
            if (!handler) {
                onUnhandledRequest(request, handlers, options.onUnhandledRequest);
                emitter.emit('request:unhandled', request);
                emitter.emit('request:end', request);
                (_b = handleRequestOptions === null || handleRequestOptions === void 0 ? void 0 : handleRequestOptions.onBypassResponse) === null || _b === void 0 ? void 0 : _b.call(handleRequestOptions, request);
                return;
            }
            // When the handled request returned no mocked response, warn the developer,
            // as it may be an oversight on their part. Perform the request as-is.
            if (!response) {
                devUtils.warn('Expected a mocking resolver function to return a mocked response Object, but got: %s. Original response is going to be used instead.', response);
                emitter.emit('request:end', request);
                (_c = handleRequestOptions === null || handleRequestOptions === void 0 ? void 0 : handleRequestOptions.onBypassResponse) === null || _c === void 0 ? void 0 : _c.call(handleRequestOptions, request);
                return;
            }
            // Store all the received response cookies in the virtual cookie store.
            readResponseCookies(request, response);
            emitter.emit('request:match', request);
            return new Promise((resolve) => {
                var _a, _b, _c;
                const requiredLookupResult = lookupResult;
                const transformedResponse = ((_a = handleRequestOptions === null || handleRequestOptions === void 0 ? void 0 : handleRequestOptions.transformResponse) === null || _a === void 0 ? void 0 : _a.call(handleRequestOptions, response)) ||
                    response;
                (_b = handleRequestOptions === null || handleRequestOptions === void 0 ? void 0 : handleRequestOptions.onMockedResponse) === null || _b === void 0 ? void 0 : _b.call(handleRequestOptions, transformedResponse, requiredLookupResult);
                setTimeout(() => {
                    var _a;
                    (_a = handleRequestOptions === null || handleRequestOptions === void 0 ? void 0 : handleRequestOptions.onMockedResponseSent) === null || _a === void 0 ? void 0 : _a.call(handleRequestOptions, transformedResponse, requiredLookupResult);
                    emitter.emit('request:end', request);
                    resolve(transformedResponse);
                }, (_c = response.delay) !== null && _c !== void 0 ? _c : 0);
            });
        });
    }

    const createRequestListener = (context, options) => {
        return (event, message) => __awaiter$3(void 0, void 0, void 0, function* () {
            const channel = createBroadcastChannel(event);
            try {
                const request = parseWorkerRequest(message.payload);
                yield handleRequest(request, context.requestHandlers, options, context.emitter, {
                    transformResponse(response) {
                        return Object.assign(Object.assign({}, response), { headers: response.headers.all() });
                    },
                    onBypassResponse() {
                        return channel.send({
                            type: 'MOCK_NOT_FOUND',
                        });
                    },
                    onMockedResponse(response) {
                        channel.send({
                            type: 'MOCK_SUCCESS',
                            payload: response,
                        });
                    },
                    onMockedResponseSent(response, { handler, publicRequest, parsedRequest }) {
                        if (!options.quiet) {
                            handler.log(publicRequest, response, handler, parsedRequest);
                        }
                    },
                });
            }
            catch (error) {
                if (error instanceof NetworkError) {
                    // Treat emulated network error differently,
                    // as it is an intended exception in a request handler.
                    return channel.send({
                        type: 'NETWORK_ERROR',
                        payload: {
                            name: error.name,
                            message: error.message,
                        },
                    });
                }
                // Treat all the other exceptions in a request handler
                // as unintended, alerting that there is a problem needs fixing.
                channel.send({
                    type: 'INTERNAL_ERROR',
                    payload: {
                        status: 500,
                        body: JSON.stringify({
                            errorType: error.constructor.name,
                            message: error.message,
                            location: error.stack,
                        }),
                    },
                });
            }
        });
    };

    function requestIntegrityCheck(context, serviceWorker) {
        return __awaiter$3(this, void 0, void 0, function* () {
            // Signal Service Worker to report back its integrity
            context.workerChannel.send('INTEGRITY_CHECK_REQUEST');
            const { payload: actualChecksum } = yield context.events.once('INTEGRITY_CHECK_RESPONSE');
            // Compare the response from the Service Worker and the
            // global variable set by Rollup during the build.
            if (actualChecksum !== "f0a916b13c8acc2b526a03a6d26df85f") {
                throw new Error(`Currently active Service Worker (${actualChecksum}) is behind the latest published one (${"f0a916b13c8acc2b526a03a6d26df85f"}).`);
            }
            return serviceWorker;
        });
    }

    /**
     * Intercepts and defers any requests on the page
     * until the Service Worker instance is ready.
     * Must only be used in a browser.
     */
    function deferNetworkRequestsUntil(predicatePromise) {
        // Defer any `XMLHttpRequest` requests until the Service Worker is ready.
        const originalXhrSend = window.XMLHttpRequest.prototype.send;
        window.XMLHttpRequest.prototype.send = function (...args) {
            // Keep this function synchronous to comply with `XMLHttpRequest.prototype.send`,
            // because that method is always synchronous.
            until(() => predicatePromise).then(() => {
                window.XMLHttpRequest.prototype.send = originalXhrSend;
                this.send(...args);
            });
        };
        // Defer any `fetch` requests until the Service Worker is ready.
        const originalFetch = window.fetch;
        window.fetch = (...args) => __awaiter$3(this, void 0, void 0, function* () {
            yield until(() => predicatePromise);
            window.fetch = originalFetch;
            return window.fetch(...args);
        });
    }

    function createResponseListener(context) {
        return (_, message) => {
            var _a;
            const { payload: responseJson } = message;
            /**
             * CORS requests with `mode: "no-cors"` result in "opaque" responses.
             * That kind of responses cannot be manipulated in JavaScript due
             * to the security considerations.
             * @see https://fetch.spec.whatwg.org/#concept-filtered-response-opaque
             * @see https://github.com/mswjs/msw/issues/529
             */
            if ((_a = responseJson.type) === null || _a === void 0 ? void 0 : _a.includes('opaque')) {
                return;
            }
            const response = new Response(responseJson.body || null, responseJson);
            const isMockedResponse = response.headers.get('x-powered-by') === 'msw';
            if (isMockedResponse) {
                context.emitter.emit('response:mocked', response, responseJson.requestId);
            }
            else {
                context.emitter.emit('response:bypass', response, responseJson.requestId);
            }
        };
    }

    function validateWorkerScope(registration, options) {
        if (!(options === null || options === void 0 ? void 0 : options.quiet) && !location.href.startsWith(registration.scope)) {
            devUtils.warn(`\
Cannot intercept requests on this page because it's outside of the worker's scope ("${registration.scope}"). If you wish to mock API requests on this page, you must resolve this scope issue.

- (Recommended) Register the worker at the root level ("/") of your application.
- Set the "Service-Worker-Allowed" response header to allow out-of-scope workers.\
`);
        }
    }

    const createStartHandler = (context) => {
        return function start(options, customOptions) {
            const startWorkerInstance = () => __awaiter$3(this, void 0, void 0, function* () {
                // Remove all previously existing event listeners.
                // This way none of the listeners persists between Fast refresh
                // of the application's code.
                context.events.removeAllListeners();
                // Handle requests signaled by the worker.
                context.workerChannel.on('REQUEST', createRequestListener(context, options));
                context.workerChannel.on('RESPONSE', createResponseListener(context));
                const instance = yield getWorkerInstance(options.serviceWorker.url, options.serviceWorker.options, options.findWorker);
                const [worker, registration] = instance;
                if (!worker) {
                    const missingWorkerMessage = (customOptions === null || customOptions === void 0 ? void 0 : customOptions.findWorker)
                        ? devUtils.formatMessage(`Failed to locate the Service Worker registration using a custom "findWorker" predicate.

Please ensure that the custom predicate properly locates the Service Worker registration at "%s".
More details: https://mswjs.io/docs/api/setup-worker/start#findworker
`, options.serviceWorker.url)
                        : devUtils.formatMessage(`Failed to locate the Service Worker registration.

This most likely means that the worker script URL "%s" cannot resolve against the actual public hostname (%s). This may happen if your application runs behind a proxy, or has a dynamic hostname.

Please consider using a custom "serviceWorker.url" option to point to the actual worker script location, or a custom "findWorker" option to resolve the Service Worker registration manually. More details: https://mswjs.io/docs/api/setup-worker/start`, options.serviceWorker.url, location.host);
                    throw new Error(missingWorkerMessage);
                }
                context.worker = worker;
                context.registration = registration;
                context.events.addListener(window, 'beforeunload', () => {
                    if (worker.state !== 'redundant') {
                        // Notify the Service Worker that this client has closed.
                        // Internally, it's similar to disabling the mocking, only
                        // client close event has a handler that self-terminates
                        // the Service Worker when there are no open clients.
                        context.workerChannel.send('CLIENT_CLOSED');
                    }
                    // Make sure we're always clearing the interval - there are reports that not doing this can
                    // cause memory leaks in headless browser environments.
                    window.clearInterval(context.keepAliveInterval);
                });
                // Check if the active Service Worker is the latest published one
                const [integrityError] = yield until(() => requestIntegrityCheck(context, worker));
                if (integrityError) {
                    devUtils.error(`\
Detected outdated Service Worker: ${integrityError.message}

The mocking is still enabled, but it's highly recommended that you update your Service Worker by running:

$ npx msw init <PUBLIC_DIR>

This is necessary to ensure that the Service Worker is in sync with the library to guarantee its stability.
If this message still persists after updating, please report an issue: https://github.com/open-draft/msw/issues\
      `);
                }
                yield enableMocking(context, options).catch((err) => {
                    throw new Error(`Failed to enable mocking: ${err === null || err === void 0 ? void 0 : err.message}`);
                });
                context.keepAliveInterval = window.setInterval(() => context.workerChannel.send('KEEPALIVE_REQUEST'), 5000);
                // Warn the user when loading the page that lies outside
                // of the worker's scope.
                validateWorkerScope(registration, context.startOptions);
                return registration;
            });
            const workerRegistration = startWorkerInstance();
            // Defer any network requests until the Service Worker instance is ready.
            // This prevents a race condition between the Service Worker registration
            // and application's runtime requests (i.e. requests on mount).
            if (options.waitUntilReady) {
                deferNetworkRequestsUntil(workerRegistration);
            }
            return workerRegistration;
        };
    };

    function printStopMessage(args = {}) {
        if (args.quiet) {
            return;
        }
        console.log(`%c${devUtils.formatMessage('Mocking disabled.')}`, 'color:orangered;font-weight:bold;');
    }

    const createStop = (context) => {
        return function stop() {
            var _a;
            /**
             * Signal the Service Worker to disable mocking for this client.
             * Use this an an explicit way to stop the mocking, while preserving
             * the worker-client relation. Does not affect the worker's lifecycle.
             */
            context.workerChannel.send('MOCK_DEACTIVATE');
            window.clearInterval(context.keepAliveInterval);
            printStopMessage({ quiet: (_a = context.startOptions) === null || _a === void 0 ? void 0 : _a.quiet });
        };
    };

    function use(currentHandlers, ...handlers) {
        currentHandlers.unshift(...handlers);
    }
    function restoreHandlers(handlers) {
        handlers.forEach((handler) => {
            handler.markAsSkipped(false);
        });
    }
    function resetHandlers(initialHandlers, ...nextHandlers) {
        return nextHandlers.length > 0 ? [...nextHandlers] : [...initialHandlers];
    }

    const DEFAULT_START_OPTIONS = {
        serviceWorker: {
            url: '/mockServiceWorker.js',
            options: null,
        },
        quiet: false,
        waitUntilReady: true,
        onUnhandledRequest: 'warn',
        findWorker(scriptURL, mockServiceWorkerUrl) {
            return scriptURL === mockServiceWorkerUrl;
        },
    };
    /**
     * Returns resolved worker start options, merging the default options
     * with the given custom options.
     */
    function resolveStartOptions(initialOptions) {
        return mergeRight(DEFAULT_START_OPTIONS, initialOptions || {});
    }
    function prepareStartHandler(handler, context) {
        return (initialOptions) => {
            context.startOptions = resolveStartOptions(initialOptions);
            return handler(context.startOptions, initialOptions || {});
        };
    }

    var lib = {};

    var createInterceptor$1 = {};

    Object.defineProperty(createInterceptor$1, "__esModule", { value: true });
    createInterceptor$1.createInterceptor = void 0;
    var strict_event_emitter_1$1 = lib$3;
    function createInterceptor(options) {
        var observer = new strict_event_emitter_1$1.StrictEventEmitter();
        var cleanupFns = [];
        return {
            apply: function () {
                cleanupFns = options.modules.map(function (interceptor) {
                    return interceptor(observer, options.resolver);
                });
            },
            on: function (event, listener) {
                observer.addListener(event, listener);
            },
            restore: function () {
                observer.removeAllListeners();
                if (cleanupFns.length === 0) {
                    throw new Error("Failed to restore patched modules: no patches found. Did you forget to run \".apply()\"?");
                }
                cleanupFns.forEach(function (restore) { return restore(); });
            },
        };
    }
    createInterceptor$1.createInterceptor = createInterceptor;

    var remote = {};

    var toIsoResponse$1 = {};

    Object.defineProperty(toIsoResponse$1, "__esModule", { value: true });
    toIsoResponse$1.toIsoResponse = void 0;
    var headers_utils_1$3 = lib$1$1;
    /**
     * Converts a given mocked response object into an isomorphic response.
     */
    function toIsoResponse(response) {
        return {
            status: response.status || 200,
            statusText: response.statusText || 'OK',
            headers: headers_utils_1$3.objectToHeaders(response.headers || {}),
            body: response.body,
        };
    }
    toIsoResponse$1.toIsoResponse = toIsoResponse;

    var __assign$1 = (commonjsGlobal && commonjsGlobal.__assign) || function () {
        __assign$1 = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign$1.apply(this, arguments);
    };
    var __awaiter$2 = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator$2 = (commonjsGlobal && commonjsGlobal.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var __read$1 = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    Object.defineProperty(remote, "__esModule", { value: true });
    remote.createRemoteResolver = remote.createRemoteInterceptor = void 0;
    var headers_utils_1$2 = lib$1$1;
    var outvariant_1 = lib$4;
    var strict_event_emitter_1 = lib$3;
    var createInterceptor_1 = createInterceptor$1;
    var toIsoResponse_1$2 = toIsoResponse$1;
    function requestReviver(key, value) {
        switch (key) {
            case 'url':
                return new URL(value);
            case 'headers':
                return new headers_utils_1$2.Headers(value);
            default:
                return value;
        }
    }
    /**
     * Creates a remote request interceptor that delegates
     * the mocked response resolution to the parent process.
     * The parent process must establish a remote resolver
     * by calling `createRemoteResolver` function.
     */
    function createRemoteInterceptor(options) {
        outvariant_1.invariant(process.connected, "Failed to create a remote interceptor: the current process (%s) does not have a parent. Please make sure you're spawning this process as a child process in order to use remote request interception.", process.pid);
        if (typeof process.send === 'undefined') {
            throw new Error("Failed to create a remote interceptor: the current process (" + process.pid + ") does not have the IPC enabled. Please make sure you're spawning this process with the \"ipc\" stdio value set:\n\nspawn('node', ['module.js'], { stdio: ['ipc'] })");
        }
        var handleParentMessage;
        var interceptor = createInterceptor_1.createInterceptor(__assign$1(__assign$1({}, options), { resolver: function (request) {
                var _a;
                var serializedRequest = JSON.stringify(request);
                (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, "request:" + serializedRequest);
                return new Promise(function (resolve) {
                    handleParentMessage = function (message) {
                        if (typeof message !== 'string') {
                            return;
                        }
                        if (message.startsWith("response:" + request.id)) {
                            var _a = __read$1(message.match(/^response:.+?:(.+)$/) || [], 2), responseString = _a[1];
                            if (!responseString) {
                                return resolve();
                            }
                            var mockedResponse = JSON.parse(responseString);
                            return resolve(mockedResponse);
                        }
                    };
                    process.addListener('message', handleParentMessage);
                });
            } }));
        return __assign$1(__assign$1({}, interceptor), { restore: function () {
                interceptor.restore();
                process.removeListener('message', handleParentMessage);
            } });
    }
    remote.createRemoteInterceptor = createRemoteInterceptor;
    /**
     * Creates a response resolver function attached to the given `ChildProcess`.
     * The child process must establish a remote interceptor by calling `createRemoteInterceptor` function.
     */
    function createRemoteResolver(options) {
        var _this = this;
        var observer = new strict_event_emitter_1.StrictEventEmitter();
        var handleChildMessage = function (message) { return __awaiter$2(_this, void 0, void 0, function () {
            var _a, requestString, isoRequest_1, mockedResponse_1, serializedResponse;
            return __generator$2(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (typeof message !== 'string') {
                            return [2 /*return*/];
                        }
                        if (!message.startsWith('request:')) return [3 /*break*/, 2];
                        _a = __read$1(message.match(/^request:(.+)$/) || [], 2), requestString = _a[1];
                        if (!requestString) {
                            return [2 /*return*/];
                        }
                        isoRequest_1 = JSON.parse(requestString, requestReviver);
                        observer.emit('request', isoRequest_1);
                        return [4 /*yield*/, options.resolver(isoRequest_1, undefined)
                            // Send the mocked response to the child process.
                        ];
                    case 1:
                        mockedResponse_1 = _b.sent();
                        serializedResponse = JSON.stringify(mockedResponse_1);
                        options.process.send("response:" + isoRequest_1.id + ":" + serializedResponse, function (error) {
                            if (error) {
                                return;
                            }
                            if (mockedResponse_1) {
                                // Emit an optimisting "response" event at this point,
                                // not to rely on the back-and-forth signaling for the sake of the event.
                                observer.emit('response', isoRequest_1, toIsoResponse_1$2.toIsoResponse(mockedResponse_1));
                            }
                        });
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        var cleanup = function () {
            options.process.removeListener('message', handleChildMessage);
        };
        options.process.addListener('message', handleChildMessage);
        options.process.addListener('disconnect', cleanup);
        options.process.addListener('error', cleanup);
        options.process.addListener('exit', cleanup);
        return {
            on: function (event, listener) {
                observer.addListener(event, listener);
            },
        };
    }
    remote.createRemoteResolver = createRemoteResolver;

    (function (exports) {
    var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
    }) : (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }));
    var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCleanUrl = void 0;
    __exportStar(createInterceptor$1, exports);
    __exportStar(remote, exports);
    /* Utils */
    var getCleanUrl_1 = getCleanUrl$1;
    Object.defineProperty(exports, "getCleanUrl", { enumerable: true, get: function () { return getCleanUrl_1.getCleanUrl; } });

    }(lib));

    var fetch$1 = {};

    var uuid = {};

    Object.defineProperty(uuid, "__esModule", { value: true });
    uuid.uuidv4 = void 0;
    function uuidv4$1() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0;
            var v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    uuid.uuidv4 = uuidv4$1;

    var __assign = (commonjsGlobal && commonjsGlobal.__assign) || function () {
        __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    var __awaiter$1 = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator$1 = (commonjsGlobal && commonjsGlobal.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    Object.defineProperty(fetch$1, "__esModule", { value: true });
    var interceptFetch_1 = fetch$1.interceptFetch = void 0;
    var headers_utils_1$1 = lib$1$1;
    var toIsoResponse_1$1 = toIsoResponse$1;
    var uuid_1$1 = uuid;
    var debug$1 = browser('fetch');
    var interceptFetch = function (observer, resolver) {
        var pureFetch = window.fetch;
        debug$1('replacing "window.fetch"...');
        window.fetch = function (input, init) { return __awaiter$1(void 0, void 0, void 0, function () {
            var ref, url, method, isoRequest, response, isomorphicResponse;
            var _a;
            return __generator$1(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        ref = new Request(input, init);
                        url = typeof input === 'string' ? input : input.url;
                        method = (init === null || init === void 0 ? void 0 : init.method) || 'GET';
                        debug$1('[%s] %s', method, url);
                        _a = {
                            id: uuid_1$1.uuidv4(),
                            url: new URL(url, location.origin),
                            method: method,
                            headers: new headers_utils_1$1.Headers((init === null || init === void 0 ? void 0 : init.headers) || {})
                        };
                        return [4 /*yield*/, ref.text()];
                    case 1:
                        isoRequest = (_a.body = _b.sent(),
                            _a);
                        debug$1('isomorphic request', isoRequest);
                        observer.emit('request', isoRequest);
                        debug$1('awaiting for the mocked response...');
                        return [4 /*yield*/, resolver(isoRequest, ref)];
                    case 2:
                        response = _b.sent();
                        debug$1('mocked response', response);
                        if (response) {
                            isomorphicResponse = toIsoResponse_1$1.toIsoResponse(response);
                            debug$1('derived isomorphic response', isomorphicResponse);
                            observer.emit('response', isoRequest, isomorphicResponse);
                            return [2 /*return*/, new Response(response.body, __assign(__assign({}, isomorphicResponse), { 
                                    // `Response.headers` cannot be instantiated with the `Headers` polyfill.
                                    // Apparently, it halts if the `Headers` class contains unknown properties
                                    // (i.e. the internal `Headers.map`).
                                    headers: headers_utils_1$1.flattenHeadersObject(response.headers || {}) }))];
                        }
                        debug$1('no mocked response found, bypassing...');
                        return [2 /*return*/, pureFetch(input, init).then(function (response) { return __awaiter$1(void 0, void 0, void 0, function () {
                                var _a, _b, _c;
                                return __generator$1(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            debug$1('original fetch performed', response);
                                            _b = (_a = observer).emit;
                                            _c = ['response',
                                                isoRequest];
                                            return [4 /*yield*/, normalizeFetchResponse(response)];
                                        case 1:
                                            _b.apply(_a, _c.concat([_d.sent()]));
                                            return [2 /*return*/, response];
                                    }
                                });
                            }); })];
                }
            });
        }); };
        return function () {
            debug$1('restoring modules...');
            window.fetch = pureFetch;
        };
    };
    interceptFetch_1 = fetch$1.interceptFetch = interceptFetch;
    function normalizeFetchResponse(response) {
        return __awaiter$1(this, void 0, void 0, function () {
            var _a;
            return __generator$1(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {
                            status: response.status,
                            statusText: response.statusText,
                            headers: headers_utils_1$1.objectToHeaders(headers_utils_1$1.headersToObject(response.headers))
                        };
                        return [4 /*yield*/, response.text()];
                    case 1: return [2 /*return*/, (_a.body = _b.sent(),
                            _a)];
                }
            });
        });
    }

    var XMLHttpRequest = {};

    var XMLHttpRequestOverride = {};

    var domParser = {};

    var conventions$2 = {};

    /**
     * "Shallow freezes" an object to render it immutable.
     * Uses `Object.freeze` if available,
     * otherwise the immutability is only in the type.
     *
     * Is used to create "enum like" objects.
     *
     * @template T
     * @param {T} object the object to freeze
     * @param {Pick<ObjectConstructor, 'freeze'> = Object} oc `Object` by default,
     * 				allows to inject custom object constructor for tests
     * @returns {Readonly<T>}
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
     */
    function freeze(object, oc) {
    	if (oc === undefined) {
    		oc = Object;
    	}
    	return oc && typeof oc.freeze === 'function' ? oc.freeze(object) : object
    }

    /**
     * All mime types that are allowed as input to `DOMParser.parseFromString`
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString#Argument02 MDN
     * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#domparsersupportedtype WHATWG HTML Spec
     * @see DOMParser.prototype.parseFromString
     */
    var MIME_TYPE = freeze({
    	/**
    	 * `text/html`, the only mime type that triggers treating an XML document as HTML.
    	 *
    	 * @see DOMParser.SupportedType.isHTML
    	 * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
    	 * @see https://en.wikipedia.org/wiki/HTML Wikipedia
    	 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
    	 * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring WHATWG HTML Spec
    	 */
    	HTML: 'text/html',

    	/**
    	 * Helper method to check a mime type if it indicates an HTML document
    	 *
    	 * @param {string} [value]
    	 * @returns {boolean}
    	 *
    	 * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
    	 * @see https://en.wikipedia.org/wiki/HTML Wikipedia
    	 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
    	 * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring 	 */
    	isHTML: function (value) {
    		return value === MIME_TYPE.HTML
    	},

    	/**
    	 * `application/xml`, the standard mime type for XML documents.
    	 *
    	 * @see https://www.iana.org/assignments/media-types/application/xml IANA MimeType registration
    	 * @see https://tools.ietf.org/html/rfc7303#section-9.1 RFC 7303
    	 * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
    	 */
    	XML_APPLICATION: 'application/xml',

    	/**
    	 * `text/html`, an alias for `application/xml`.
    	 *
    	 * @see https://tools.ietf.org/html/rfc7303#section-9.2 RFC 7303
    	 * @see https://www.iana.org/assignments/media-types/text/xml IANA MimeType registration
    	 * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
    	 */
    	XML_TEXT: 'text/xml',

    	/**
    	 * `application/xhtml+xml`, indicates an XML document that has the default HTML namespace,
    	 * but is parsed as an XML document.
    	 *
    	 * @see https://www.iana.org/assignments/media-types/application/xhtml+xml IANA MimeType registration
    	 * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument WHATWG DOM Spec
    	 * @see https://en.wikipedia.org/wiki/XHTML Wikipedia
    	 */
    	XML_XHTML_APPLICATION: 'application/xhtml+xml',

    	/**
    	 * `image/svg+xml`,
    	 *
    	 * @see https://www.iana.org/assignments/media-types/image/svg+xml IANA MimeType registration
    	 * @see https://www.w3.org/TR/SVG11/ W3C SVG 1.1
    	 * @see https://en.wikipedia.org/wiki/Scalable_Vector_Graphics Wikipedia
    	 */
    	XML_SVG_IMAGE: 'image/svg+xml',
    });

    /**
     * Namespaces that are used in this code base.
     *
     * @see http://www.w3.org/TR/REC-xml-names
     */
    var NAMESPACE$3 = freeze({
    	/**
    	 * The XHTML namespace.
    	 *
    	 * @see http://www.w3.org/1999/xhtml
    	 */
    	HTML: 'http://www.w3.org/1999/xhtml',

    	/**
    	 * Checks if `uri` equals `NAMESPACE.HTML`.
    	 *
    	 * @param {string} [uri]
    	 *
    	 * @see NAMESPACE.HTML
    	 */
    	isHTML: function (uri) {
    		return uri === NAMESPACE$3.HTML
    	},

    	/**
    	 * The SVG namespace.
    	 *
    	 * @see http://www.w3.org/2000/svg
    	 */
    	SVG: 'http://www.w3.org/2000/svg',

    	/**
    	 * The `xml:` namespace.
    	 *
    	 * @see http://www.w3.org/XML/1998/namespace
    	 */
    	XML: 'http://www.w3.org/XML/1998/namespace',

    	/**
    	 * The `xmlns:` namespace
    	 *
    	 * @see https://www.w3.org/2000/xmlns/
    	 */
    	XMLNS: 'http://www.w3.org/2000/xmlns/',
    });

    conventions$2.freeze = freeze;
    conventions$2.MIME_TYPE = MIME_TYPE;
    conventions$2.NAMESPACE = NAMESPACE$3;

    var entities$1 = {};

    (function (exports) {
    var freeze = conventions$2.freeze;

    /**
     * The entities that are predefined in every XML document.
     *
     * @see https://www.w3.org/TR/2006/REC-xml11-20060816/#sec-predefined-ent W3C XML 1.1
     * @see https://www.w3.org/TR/2008/REC-xml-20081126/#sec-predefined-ent W3C XML 1.0
     * @see https://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references#Predefined_entities_in_XML Wikipedia
     */
    exports.XML_ENTITIES = freeze({amp:'&', apos:"'", gt:'>', lt:'<', quot:'"'});

    /**
     * A map of currently 241 entities that are detected in an HTML document.
     * They contain all entries from `XML_ENTITIES`.
     *
     * @see XML_ENTITIES
     * @see DOMParser.parseFromString
     * @see DOMImplementation.prototype.createHTMLDocument
     * @see https://html.spec.whatwg.org/#named-character-references WHATWG HTML(5) Spec
     * @see https://www.w3.org/TR/xml-entity-names/ W3C XML Entity Names
     * @see https://www.w3.org/TR/html4/sgml/entities.html W3C HTML4/SGML
     * @see https://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references#Character_entity_references_in_HTML Wikipedia (HTML)
     * @see https://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references#Entities_representing_special_characters_in_XHTML Wikpedia (XHTML)
     */
    exports.HTML_ENTITIES = freeze({
           lt: '<',
           gt: '>',
           amp: '&',
           quot: '"',
           apos: "'",
           Agrave: "À",
           Aacute: "Á",
           Acirc: "Â",
           Atilde: "Ã",
           Auml: "Ä",
           Aring: "Å",
           AElig: "Æ",
           Ccedil: "Ç",
           Egrave: "È",
           Eacute: "É",
           Ecirc: "Ê",
           Euml: "Ë",
           Igrave: "Ì",
           Iacute: "Í",
           Icirc: "Î",
           Iuml: "Ï",
           ETH: "Ð",
           Ntilde: "Ñ",
           Ograve: "Ò",
           Oacute: "Ó",
           Ocirc: "Ô",
           Otilde: "Õ",
           Ouml: "Ö",
           Oslash: "Ø",
           Ugrave: "Ù",
           Uacute: "Ú",
           Ucirc: "Û",
           Uuml: "Ü",
           Yacute: "Ý",
           THORN: "Þ",
           szlig: "ß",
           agrave: "à",
           aacute: "á",
           acirc: "â",
           atilde: "ã",
           auml: "ä",
           aring: "å",
           aelig: "æ",
           ccedil: "ç",
           egrave: "è",
           eacute: "é",
           ecirc: "ê",
           euml: "ë",
           igrave: "ì",
           iacute: "í",
           icirc: "î",
           iuml: "ï",
           eth: "ð",
           ntilde: "ñ",
           ograve: "ò",
           oacute: "ó",
           ocirc: "ô",
           otilde: "õ",
           ouml: "ö",
           oslash: "ø",
           ugrave: "ù",
           uacute: "ú",
           ucirc: "û",
           uuml: "ü",
           yacute: "ý",
           thorn: "þ",
           yuml: "ÿ",
           nbsp: "\u00a0",
           iexcl: "¡",
           cent: "¢",
           pound: "£",
           curren: "¤",
           yen: "¥",
           brvbar: "¦",
           sect: "§",
           uml: "¨",
           copy: "©",
           ordf: "ª",
           laquo: "«",
           not: "¬",
           shy: "­­",
           reg: "®",
           macr: "¯",
           deg: "°",
           plusmn: "±",
           sup2: "²",
           sup3: "³",
           acute: "´",
           micro: "µ",
           para: "¶",
           middot: "·",
           cedil: "¸",
           sup1: "¹",
           ordm: "º",
           raquo: "»",
           frac14: "¼",
           frac12: "½",
           frac34: "¾",
           iquest: "¿",
           times: "×",
           divide: "÷",
           forall: "∀",
           part: "∂",
           exist: "∃",
           empty: "∅",
           nabla: "∇",
           isin: "∈",
           notin: "∉",
           ni: "∋",
           prod: "∏",
           sum: "∑",
           minus: "−",
           lowast: "∗",
           radic: "√",
           prop: "∝",
           infin: "∞",
           ang: "∠",
           and: "∧",
           or: "∨",
           cap: "∩",
           cup: "∪",
           'int': "∫",
           there4: "∴",
           sim: "∼",
           cong: "≅",
           asymp: "≈",
           ne: "≠",
           equiv: "≡",
           le: "≤",
           ge: "≥",
           sub: "⊂",
           sup: "⊃",
           nsub: "⊄",
           sube: "⊆",
           supe: "⊇",
           oplus: "⊕",
           otimes: "⊗",
           perp: "⊥",
           sdot: "⋅",
           Alpha: "Α",
           Beta: "Β",
           Gamma: "Γ",
           Delta: "Δ",
           Epsilon: "Ε",
           Zeta: "Ζ",
           Eta: "Η",
           Theta: "Θ",
           Iota: "Ι",
           Kappa: "Κ",
           Lambda: "Λ",
           Mu: "Μ",
           Nu: "Ν",
           Xi: "Ξ",
           Omicron: "Ο",
           Pi: "Π",
           Rho: "Ρ",
           Sigma: "Σ",
           Tau: "Τ",
           Upsilon: "Υ",
           Phi: "Φ",
           Chi: "Χ",
           Psi: "Ψ",
           Omega: "Ω",
           alpha: "α",
           beta: "β",
           gamma: "γ",
           delta: "δ",
           epsilon: "ε",
           zeta: "ζ",
           eta: "η",
           theta: "θ",
           iota: "ι",
           kappa: "κ",
           lambda: "λ",
           mu: "μ",
           nu: "ν",
           xi: "ξ",
           omicron: "ο",
           pi: "π",
           rho: "ρ",
           sigmaf: "ς",
           sigma: "σ",
           tau: "τ",
           upsilon: "υ",
           phi: "φ",
           chi: "χ",
           psi: "ψ",
           omega: "ω",
           thetasym: "ϑ",
           upsih: "ϒ",
           piv: "ϖ",
           OElig: "Œ",
           oelig: "œ",
           Scaron: "Š",
           scaron: "š",
           Yuml: "Ÿ",
           fnof: "ƒ",
           circ: "ˆ",
           tilde: "˜",
           ensp: " ",
           emsp: " ",
           thinsp: " ",
           zwnj: "‌",
           zwj: "‍",
           lrm: "‎",
           rlm: "‏",
           ndash: "–",
           mdash: "—",
           lsquo: "‘",
           rsquo: "’",
           sbquo: "‚",
           ldquo: "“",
           rdquo: "”",
           bdquo: "„",
           dagger: "†",
           Dagger: "‡",
           bull: "•",
           hellip: "…",
           permil: "‰",
           prime: "′",
           Prime: "″",
           lsaquo: "‹",
           rsaquo: "›",
           oline: "‾",
           euro: "€",
           trade: "™",
           larr: "←",
           uarr: "↑",
           rarr: "→",
           darr: "↓",
           harr: "↔",
           crarr: "↵",
           lceil: "⌈",
           rceil: "⌉",
           lfloor: "⌊",
           rfloor: "⌋",
           loz: "◊",
           spades: "♠",
           clubs: "♣",
           hearts: "♥",
           diams: "♦"
    });

    /**
     * @deprecated use `HTML_ENTITIES` instead
     * @see HTML_ENTITIES
     */
    exports.entityMap = exports.HTML_ENTITIES;
    }(entities$1));

    var sax$1 = {};

    var NAMESPACE$2 = conventions$2.NAMESPACE;

    //[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
    //[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
    //[5]   	Name	   ::=   	NameStartChar (NameChar)*
    var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;//\u10000-\uEFFFF
    var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
    var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
    //var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
    //var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

    //S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
    //S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
    var S_TAG = 0;//tag name offerring
    var S_ATTR = 1;//attr name offerring 
    var S_ATTR_SPACE=2;//attr name end and space offer
    var S_EQ = 3;//=space?
    var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
    var S_ATTR_END = 5;//attr value end and no space(quot end)
    var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
    var S_TAG_CLOSE = 7;//closed el<el />

    /**
     * Creates an error that will not be caught by XMLReader aka the SAX parser.
     *
     * @param {string} message
     * @param {any?} locator Optional, can provide details about the location in the source
     * @constructor
     */
    function ParseError$1(message, locator) {
    	this.message = message;
    	this.locator = locator;
    	if(Error.captureStackTrace) Error.captureStackTrace(this, ParseError$1);
    }
    ParseError$1.prototype = new Error();
    ParseError$1.prototype.name = ParseError$1.name;

    function XMLReader$1(){
    	
    }

    XMLReader$1.prototype = {
    	parse:function(source,defaultNSMap,entityMap){
    		var domBuilder = this.domBuilder;
    		domBuilder.startDocument();
    		_copy(defaultNSMap ,defaultNSMap = {});
    		parse(source,defaultNSMap,entityMap,
    				domBuilder,this.errorHandler);
    		domBuilder.endDocument();
    	}
    };
    function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
    	function fixedFromCharCode(code) {
    		// String.prototype.fromCharCode does not supports
    		// > 2 bytes unicode chars directly
    		if (code > 0xffff) {
    			code -= 0x10000;
    			var surrogate1 = 0xd800 + (code >> 10)
    				, surrogate2 = 0xdc00 + (code & 0x3ff);

    			return String.fromCharCode(surrogate1, surrogate2);
    		} else {
    			return String.fromCharCode(code);
    		}
    	}
    	function entityReplacer(a){
    		var k = a.slice(1,-1);
    		if(k in entityMap){
    			return entityMap[k]; 
    		}else if(k.charAt(0) === '#'){
    			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
    		}else {
    			errorHandler.error('entity not found:'+a);
    			return a;
    		}
    	}
    	function appendText(end){//has some bugs
    		if(end>start){
    			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
    			locator&&position(start);
    			domBuilder.characters(xt,0,end-start);
    			start = end;
    		}
    	}
    	function position(p,m){
    		while(p>=lineEnd && (m = linePattern.exec(source))){
    			lineStart = m.index;
    			lineEnd = lineStart + m[0].length;
    			locator.lineNumber++;
    			//console.log('line++:',locator,startPos,endPos)
    		}
    		locator.columnNumber = p-lineStart+1;
    	}
    	var lineStart = 0;
    	var lineEnd = 0;
    	var linePattern = /.*(?:\r\n?|\n)|.*$/g;
    	var locator = domBuilder.locator;
    	
    	var parseStack = [{currentNSMap:defaultNSMapCopy}];
    	var closeMap = {};
    	var start = 0;
    	while(true){
    		try{
    			var tagStart = source.indexOf('<',start);
    			if(tagStart<0){
    				if(!source.substr(start).match(/^\s*$/)){
    					var doc = domBuilder.doc;
    	    			var text = doc.createTextNode(source.substr(start));
    	    			doc.appendChild(text);
    	    			domBuilder.currentElement = text;
    				}
    				return;
    			}
    			if(tagStart>start){
    				appendText(tagStart);
    			}
    			switch(source.charAt(tagStart+1)){
    			case '/':
    				var end = source.indexOf('>',tagStart+3);
    				var tagName = source.substring(tagStart + 2, end).replace(/[ \t\n\r]+$/g, '');
    				var config = parseStack.pop();
    				if(end<0){
    					
    	        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
    	        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
    	        		end = tagStart+1+tagName.length;
    	        	}else if(tagName.match(/\s</)){
    	        		tagName = tagName.replace(/[\s<].*/,'');
    	        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
    	        		end = tagStart+1+tagName.length;
    				}
    				var localNSMap = config.localNSMap;
    				var endMatch = config.tagName == tagName;
    				var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase();
    		        if(endIgnoreCaseMach){
    		        	domBuilder.endElement(config.uri,config.localName,tagName);
    					if(localNSMap){
    						for(var prefix in localNSMap){
    							domBuilder.endPrefixMapping(prefix) ;
    						}
    					}
    					if(!endMatch){
    		            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName ); // No known test case
    					}
    		        }else {
    		        	parseStack.push(config);
    		        }
    				
    				end++;
    				break;
    				// end elment
    			case '?':// <?...?>
    				locator&&position(tagStart);
    				end = parseInstruction(source,tagStart,domBuilder);
    				break;
    			case '!':// <!doctype,<![CDATA,<!--
    				locator&&position(tagStart);
    				end = parseDCC(source,tagStart,domBuilder,errorHandler);
    				break;
    			default:
    				locator&&position(tagStart);
    				var el = new ElementAttributes();
    				var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
    				//elStartEnd
    				var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
    				var len = el.length;
    				
    				
    				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
    					el.closed = true;
    					if(!entityMap.nbsp){
    						errorHandler.warning('unclosed xml attribute');
    					}
    				}
    				if(locator && len){
    					var locator2 = copyLocator(locator,{});
    					//try{//attribute position fixed
    					for(var i = 0;i<len;i++){
    						var a = el[i];
    						position(a.offset);
    						a.locator = copyLocator(locator,{});
    					}
    					domBuilder.locator = locator2;
    					if(appendElement$1(el,domBuilder,currentNSMap)){
    						parseStack.push(el);
    					}
    					domBuilder.locator = locator;
    				}else {
    					if(appendElement$1(el,domBuilder,currentNSMap)){
    						parseStack.push(el);
    					}
    				}

    				if (NAMESPACE$2.isHTML(el.uri) && !el.closed) {
    					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder);
    				} else {
    					end++;
    				}
    			}
    		}catch(e){
    			if (e instanceof ParseError$1) {
    				throw e;
    			}
    			errorHandler.error('element parse error: '+e);
    			end = -1;
    		}
    		if(end>start){
    			start = end;
    		}else {
    			//TODO: 这里有可能sax回退，有位置错误风险
    			appendText(Math.max(tagStart,start)+1);
    		}
    	}
    }
    function copyLocator(f,t){
    	t.lineNumber = f.lineNumber;
    	t.columnNumber = f.columnNumber;
    	return t;
    }

    /**
     * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
     * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
     */
    function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){

    	/**
    	 * @param {string} qname
    	 * @param {string} value
    	 * @param {number} startIndex
    	 */
    	function addAttribute(qname, value, startIndex) {
    		if (qname in el.attributeNames) errorHandler.fatalError('Attribute ' + qname + ' redefined');
    		el.addValue(qname, value, startIndex);
    	}
    	var attrName;
    	var value;
    	var p = ++start;
    	var s = S_TAG;//status
    	while(true){
    		var c = source.charAt(p);
    		switch(c){
    		case '=':
    			if(s === S_ATTR){//attrName
    				attrName = source.slice(start,p);
    				s = S_EQ;
    			}else if(s === S_ATTR_SPACE){
    				s = S_EQ;
    			}else {
    				//fatalError: equal must after attrName or space after attrName
    				throw new Error('attribute equal must after attrName'); // No known test case
    			}
    			break;
    		case '\'':
    		case '"':
    			if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
    				){//equal
    				if(s === S_ATTR){
    					errorHandler.warning('attribute value must after "="');
    					attrName = source.slice(start,p);
    				}
    				start = p+1;
    				p = source.indexOf(c,start);
    				if(p>0){
    					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
    					addAttribute(attrName, value, start-1);
    					s = S_ATTR_END;
    				}else {
    					//fatalError: no end quot match
    					throw new Error('attribute value no end \''+c+'\' match');
    				}
    			}else if(s == S_ATTR_NOQUOT_VALUE){
    				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
    				//console.log(attrName,value,start,p)
    				addAttribute(attrName, value, start);
    				//console.dir(el)
    				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
    				start = p+1;
    				s = S_ATTR_END;
    			}else {
    				//fatalError: no equal before
    				throw new Error('attribute value must after "="'); // No known test case
    			}
    			break;
    		case '/':
    			switch(s){
    			case S_TAG:
    				el.setTagName(source.slice(start,p));
    			case S_ATTR_END:
    			case S_TAG_SPACE:
    			case S_TAG_CLOSE:
    				s =S_TAG_CLOSE;
    				el.closed = true;
    			case S_ATTR_NOQUOT_VALUE:
    			case S_ATTR:
    			case S_ATTR_SPACE:
    				break;
    			//case S_EQ:
    			default:
    				throw new Error("attribute invalid close char('/')") // No known test case
    			}
    			break;
    		case ''://end document
    			errorHandler.error('unexpected end of input');
    			if(s == S_TAG){
    				el.setTagName(source.slice(start,p));
    			}
    			return p;
    		case '>':
    			switch(s){
    			case S_TAG:
    				el.setTagName(source.slice(start,p));
    			case S_ATTR_END:
    			case S_TAG_SPACE:
    			case S_TAG_CLOSE:
    				break;//normal
    			case S_ATTR_NOQUOT_VALUE://Compatible state
    			case S_ATTR:
    				value = source.slice(start,p);
    				if(value.slice(-1) === '/'){
    					el.closed  = true;
    					value = value.slice(0,-1);
    				}
    			case S_ATTR_SPACE:
    				if(s === S_ATTR_SPACE){
    					value = attrName;
    				}
    				if(s == S_ATTR_NOQUOT_VALUE){
    					errorHandler.warning('attribute "'+value+'" missed quot(")!');
    					addAttribute(attrName, value.replace(/&#?\w+;/g,entityReplacer), start);
    				}else {
    					if(!NAMESPACE$2.isHTML(currentNSMap['']) || !value.match(/^(?:disabled|checked|selected)$/i)){
    						errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!');
    					}
    					addAttribute(value, value, start);
    				}
    				break;
    			case S_EQ:
    				throw new Error('attribute value missed!!');
    			}
    //			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
    			return p;
    		/*xml space '\x20' | #x9 | #xD | #xA; */
    		case '\u0080':
    			c = ' ';
    		default:
    			if(c<= ' '){//space
    				switch(s){
    				case S_TAG:
    					el.setTagName(source.slice(start,p));//tagName
    					s = S_TAG_SPACE;
    					break;
    				case S_ATTR:
    					attrName = source.slice(start,p);
    					s = S_ATTR_SPACE;
    					break;
    				case S_ATTR_NOQUOT_VALUE:
    					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
    					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
    					addAttribute(attrName, value, start);
    				case S_ATTR_END:
    					s = S_TAG_SPACE;
    					break;
    				//case S_TAG_SPACE:
    				//case S_EQ:
    				//case S_ATTR_SPACE:
    				//	void();break;
    				//case S_TAG_CLOSE:
    					//ignore warning
    				}
    			}else {//not space
    //S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
    //S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
    				switch(s){
    				//case S_TAG:void();break;
    				//case S_ATTR:void();break;
    				//case S_ATTR_NOQUOT_VALUE:void();break;
    				case S_ATTR_SPACE:
    					el.tagName;
    					if (!NAMESPACE$2.isHTML(currentNSMap['']) || !attrName.match(/^(?:disabled|checked|selected)$/i)) {
    						errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!');
    					}
    					addAttribute(attrName, attrName, start);
    					start = p;
    					s = S_ATTR;
    					break;
    				case S_ATTR_END:
    					errorHandler.warning('attribute space is required"'+attrName+'"!!');
    				case S_TAG_SPACE:
    					s = S_ATTR;
    					start = p;
    					break;
    				case S_EQ:
    					s = S_ATTR_NOQUOT_VALUE;
    					start = p;
    					break;
    				case S_TAG_CLOSE:
    					throw new Error("elements closed character '/' and '>' must be connected to");
    				}
    			}
    		}//end outer switch
    		//console.log('p++',p)
    		p++;
    	}
    }
    /**
     * @return true if has new namespace define
     */
    function appendElement$1(el,domBuilder,currentNSMap){
    	var tagName = el.tagName;
    	var localNSMap = null;
    	//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
    	var i = el.length;
    	while(i--){
    		var a = el[i];
    		var qName = a.qName;
    		var value = a.value;
    		var nsp = qName.indexOf(':');
    		if(nsp>0){
    			var prefix = a.prefix = qName.slice(0,nsp);
    			var localName = qName.slice(nsp+1);
    			var nsPrefix = prefix === 'xmlns' && localName;
    		}else {
    			localName = qName;
    			prefix = null;
    			nsPrefix = qName === 'xmlns' && '';
    		}
    		//can not set prefix,because prefix !== ''
    		a.localName = localName ;
    		//prefix == null for no ns prefix attribute 
    		if(nsPrefix !== false){//hack!!
    			if(localNSMap == null){
    				localNSMap = {};
    				//console.log(currentNSMap,0)
    				_copy(currentNSMap,currentNSMap={});
    				//console.log(currentNSMap,1)
    			}
    			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
    			a.uri = NAMESPACE$2.XMLNS;
    			domBuilder.startPrefixMapping(nsPrefix, value); 
    		}
    	}
    	var i = el.length;
    	while(i--){
    		a = el[i];
    		var prefix = a.prefix;
    		if(prefix){//no prefix attribute has no namespace
    			if(prefix === 'xml'){
    				a.uri = NAMESPACE$2.XML;
    			}if(prefix !== 'xmlns'){
    				a.uri = currentNSMap[prefix || ''];
    				
    				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
    			}
    		}
    	}
    	var nsp = tagName.indexOf(':');
    	if(nsp>0){
    		prefix = el.prefix = tagName.slice(0,nsp);
    		localName = el.localName = tagName.slice(nsp+1);
    	}else {
    		prefix = null;//important!!
    		localName = el.localName = tagName;
    	}
    	//no prefix element has default namespace
    	var ns = el.uri = currentNSMap[prefix || ''];
    	domBuilder.startElement(ns,localName,tagName,el);
    	//endPrefixMapping and startPrefixMapping have not any help for dom builder
    	//localNSMap = null
    	if(el.closed){
    		domBuilder.endElement(ns,localName,tagName);
    		if(localNSMap){
    			for(prefix in localNSMap){
    				domBuilder.endPrefixMapping(prefix); 
    			}
    		}
    	}else {
    		el.currentNSMap = currentNSMap;
    		el.localNSMap = localNSMap;
    		//parseStack.push(el);
    		return true;
    	}
    }
    function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
    	if(/^(?:script|textarea)$/i.test(tagName)){
    		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
    		var text = source.substring(elStartEnd+1,elEndStart);
    		if(/[&<]/.test(text)){
    			if(/^script$/i.test(tagName)){
    				//if(!/\]\]>/.test(text)){
    					//lexHandler.startCDATA();
    					domBuilder.characters(text,0,text.length);
    					//lexHandler.endCDATA();
    					return elEndStart;
    				//}
    			}//}else{//text area
    				text = text.replace(/&#?\w+;/g,entityReplacer);
    				domBuilder.characters(text,0,text.length);
    				return elEndStart;
    			//}
    			
    		}
    	}
    	return elStartEnd+1;
    }
    function fixSelfClosed(source,elStartEnd,tagName,closeMap){
    	//if(tagName in closeMap){
    	var pos = closeMap[tagName];
    	if(pos == null){
    		//console.log(tagName)
    		pos =  source.lastIndexOf('</'+tagName+'>');
    		if(pos<elStartEnd){//忘记闭合
    			pos = source.lastIndexOf('</'+tagName);
    		}
    		closeMap[tagName] =pos;
    	}
    	return pos<elStartEnd;
    	//} 
    }
    function _copy(source,target){
    	for(var n in source){target[n] = source[n];}
    }
    function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
    	var next= source.charAt(start+2);
    	switch(next){
    	case '-':
    		if(source.charAt(start + 3) === '-'){
    			var end = source.indexOf('-->',start+4);
    			//append comment source.substring(4,end)//<!--
    			if(end>start){
    				domBuilder.comment(source,start+4,end-start-4);
    				return end+3;
    			}else {
    				errorHandler.error("Unclosed comment");
    				return -1;
    			}
    		}else {
    			//error
    			return -1;
    		}
    	default:
    		if(source.substr(start+3,6) == 'CDATA['){
    			var end = source.indexOf(']]>',start+9);
    			domBuilder.startCDATA();
    			domBuilder.characters(source,start+9,end-start-9);
    			domBuilder.endCDATA(); 
    			return end+3;
    		}
    		//<!DOCTYPE
    		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
    		var matchs = split(source,start);
    		var len = matchs.length;
    		if(len>1 && /!doctype/i.test(matchs[0][0])){
    			var name = matchs[1][0];
    			var pubid = false;
    			var sysid = false;
    			if(len>3){
    				if(/^public$/i.test(matchs[2][0])){
    					pubid = matchs[3][0];
    					sysid = len>4 && matchs[4][0];
    				}else if(/^system$/i.test(matchs[2][0])){
    					sysid = matchs[3][0];
    				}
    			}
    			var lastMatch = matchs[len-1];
    			domBuilder.startDTD(name, pubid, sysid);
    			domBuilder.endDTD();
    			
    			return lastMatch.index+lastMatch[0].length
    		}
    	}
    	return -1;
    }



    function parseInstruction(source,start,domBuilder){
    	var end = source.indexOf('?>',start);
    	if(end){
    		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
    		if(match){
    			match[0].length;
    			domBuilder.processingInstruction(match[1], match[2]) ;
    			return end+2;
    		}else {//error
    			return -1;
    		}
    	}
    	return -1;
    }

    function ElementAttributes(){
    	this.attributeNames = {};
    }
    ElementAttributes.prototype = {
    	setTagName:function(tagName){
    		if(!tagNamePattern.test(tagName)){
    			throw new Error('invalid tagName:'+tagName)
    		}
    		this.tagName = tagName;
    	},
    	addValue:function(qName, value, offset) {
    		if(!tagNamePattern.test(qName)){
    			throw new Error('invalid attribute:'+qName)
    		}
    		this.attributeNames[qName] = this.length;
    		this[this.length++] = {qName:qName,value:value,offset:offset};
    	},
    	length:0,
    	getLocalName:function(i){return this[i].localName},
    	getLocator:function(i){return this[i].locator},
    	getQName:function(i){return this[i].qName},
    	getURI:function(i){return this[i].uri},
    	getValue:function(i){return this[i].value}
    //	,getIndex:function(uri, localName)){
    //		if(localName){
    //			
    //		}else{
    //			var qName = uri
    //		}
    //	},
    //	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
    //	getType:function(uri,localName){}
    //	getType:function(i){},
    };



    function split(source,start){
    	var match;
    	var buf = [];
    	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
    	reg.lastIndex = start;
    	reg.exec(source);//skip <
    	while(match = reg.exec(source)){
    		buf.push(match);
    		if(match[1])return buf;
    	}
    }

    sax$1.XMLReader = XMLReader$1;
    sax$1.ParseError = ParseError$1;

    var dom = {};

    var conventions$1 = conventions$2;

    var NAMESPACE$1 = conventions$1.NAMESPACE;

    /**
     * A prerequisite for `[].filter`, to drop elements that are empty
     * @param {string} input
     * @returns {boolean}
     */
    function notEmptyString (input) {
    	return input !== ''
    }
    /**
     * @see https://infra.spec.whatwg.org/#split-on-ascii-whitespace
     * @see https://infra.spec.whatwg.org/#ascii-whitespace
     *
     * @param {string} input
     * @returns {string[]} (can be empty)
     */
    function splitOnASCIIWhitespace(input) {
    	// U+0009 TAB, U+000A LF, U+000C FF, U+000D CR, U+0020 SPACE
    	return input ? input.split(/[\t\n\f\r ]+/).filter(notEmptyString) : []
    }

    /**
     * Adds element as a key to current if it is not already present.
     *
     * @param {Record<string, boolean | undefined>} current
     * @param {string} element
     * @returns {Record<string, boolean | undefined>}
     */
    function orderedSetReducer (current, element) {
    	if (!current.hasOwnProperty(element)) {
    		current[element] = true;
    	}
    	return current;
    }

    /**
     * @see https://infra.spec.whatwg.org/#ordered-set
     * @param {string} input
     * @returns {string[]}
     */
    function toOrderedSet(input) {
    	if (!input) return [];
    	var list = splitOnASCIIWhitespace(input);
    	return Object.keys(list.reduce(orderedSetReducer, {}))
    }

    /**
     * Uses `list.indexOf` to implement something like `Array.prototype.includes`,
     * which we can not rely on being available.
     *
     * @param {any[]} list
     * @returns {function(any): boolean}
     */
    function arrayIncludes (list) {
    	return function(element) {
    		return list && list.indexOf(element) !== -1;
    	}
    }

    function copy(src,dest){
    	for(var p in src){
    		dest[p] = src[p];
    	}
    }

    /**
    ^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
    ^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
     */
    function _extends(Class,Super){
    	var pt = Class.prototype;
    	if(!(pt instanceof Super)){
    		function t(){}		t.prototype = Super.prototype;
    		t = new t();
    		copy(pt,t);
    		Class.prototype = pt = t;
    	}
    	if(pt.constructor != Class){
    		if(typeof Class != 'function'){
    			console.error("unknow Class:"+Class);
    		}
    		pt.constructor = Class;
    	}
    }

    // Node Types
    var NodeType = {};
    var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
    var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
    var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
    var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
    var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
    var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
    var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
    var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
    var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
    var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
    var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
    var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

    // ExceptionCode
    var ExceptionCode = {};
    var ExceptionMessage = {};
    ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
    ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
    var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
    ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
    ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
    ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
    ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
    var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
    ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
    var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
    //level2
    ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
    ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
    ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
    ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
    ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);

    /**
     * DOM Level 2
     * Object DOMException
     * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
     * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
     */
    function DOMException(code, message) {
    	if(message instanceof Error){
    		var error = message;
    	}else {
    		error = this;
    		Error.call(this, ExceptionMessage[code]);
    		this.message = ExceptionMessage[code];
    		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
    	}
    	error.code = code;
    	if(message) this.message = this.message + ": " + message;
    	return error;
    }DOMException.prototype = Error.prototype;
    copy(ExceptionCode,DOMException);

    /**
     * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
     * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
     * The items in the NodeList are accessible via an integral index, starting from 0.
     */
    function NodeList() {
    }NodeList.prototype = {
    	/**
    	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
    	 * @standard level1
    	 */
    	length:0, 
    	/**
    	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
    	 * @standard level1
    	 * @param index  unsigned long 
    	 *   Index into the collection.
    	 * @return Node
    	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
    	 */
    	item: function(index) {
    		return this[index] || null;
    	},
    	toString:function(isHTML,nodeFilter){
    		for(var buf = [], i = 0;i<this.length;i++){
    			serializeToString(this[i],buf,isHTML,nodeFilter);
    		}
    		return buf.join('');
    	}
    };

    function LiveNodeList(node,refresh){
    	this._node = node;
    	this._refresh = refresh;
    	_updateLiveList(this);
    }
    function _updateLiveList(list){
    	var inc = list._node._inc || list._node.ownerDocument._inc;
    	if(list._inc != inc){
    		var ls = list._refresh(list._node);
    		//console.log(ls.length)
    		__set__(list,'length',ls.length);
    		copy(ls,list);
    		list._inc = inc;
    	}
    }
    LiveNodeList.prototype.item = function(i){
    	_updateLiveList(this);
    	return this[i];
    };

    _extends(LiveNodeList,NodeList);

    /**
     * Objects implementing the NamedNodeMap interface are used
     * to represent collections of nodes that can be accessed by name.
     * Note that NamedNodeMap does not inherit from NodeList;
     * NamedNodeMaps are not maintained in any particular order.
     * Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index,
     * but this is simply to allow convenient enumeration of the contents of a NamedNodeMap,
     * and does not imply that the DOM specifies an order to these Nodes.
     * NamedNodeMap objects in the DOM are live.
     * used for attributes or DocumentType entities 
     */
    function NamedNodeMap() {
    }
    function _findNodeIndex(list,node){
    	var i = list.length;
    	while(i--){
    		if(list[i] === node){return i}
    	}
    }

    function _addNamedNode(el,list,newAttr,oldAttr){
    	if(oldAttr){
    		list[_findNodeIndex(list,oldAttr)] = newAttr;
    	}else {
    		list[list.length++] = newAttr;
    	}
    	if(el){
    		newAttr.ownerElement = el;
    		var doc = el.ownerDocument;
    		if(doc){
    			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
    			_onAddAttribute(doc,el,newAttr);
    		}
    	}
    }
    function _removeNamedNode(el,list,attr){
    	//console.log('remove attr:'+attr)
    	var i = _findNodeIndex(list,attr);
    	if(i>=0){
    		var lastIndex = list.length-1;
    		while(i<lastIndex){
    			list[i] = list[++i];
    		}
    		list.length = lastIndex;
    		if(el){
    			var doc = el.ownerDocument;
    			if(doc){
    				_onRemoveAttribute(doc,el,attr);
    				attr.ownerElement = null;
    			}
    		}
    	}else {
    		throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
    	}
    }
    NamedNodeMap.prototype = {
    	length:0,
    	item:NodeList.prototype.item,
    	getNamedItem: function(key) {
    //		if(key.indexOf(':')>0 || key == 'xmlns'){
    //			return null;
    //		}
    		//console.log()
    		var i = this.length;
    		while(i--){
    			var attr = this[i];
    			//console.log(attr.nodeName,key)
    			if(attr.nodeName == key){
    				return attr;
    			}
    		}
    	},
    	setNamedItem: function(attr) {
    		var el = attr.ownerElement;
    		if(el && el!=this._ownerElement){
    			throw new DOMException(INUSE_ATTRIBUTE_ERR);
    		}
    		var oldAttr = this.getNamedItem(attr.nodeName);
    		_addNamedNode(this._ownerElement,this,attr,oldAttr);
    		return oldAttr;
    	},
    	/* returns Node */
    	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
    		var el = attr.ownerElement, oldAttr;
    		if(el && el!=this._ownerElement){
    			throw new DOMException(INUSE_ATTRIBUTE_ERR);
    		}
    		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
    		_addNamedNode(this._ownerElement,this,attr,oldAttr);
    		return oldAttr;
    	},

    	/* returns Node */
    	removeNamedItem: function(key) {
    		var attr = this.getNamedItem(key);
    		_removeNamedNode(this._ownerElement,this,attr);
    		return attr;
    		
    		
    	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
    	
    	//for level2
    	removeNamedItemNS:function(namespaceURI,localName){
    		var attr = this.getNamedItemNS(namespaceURI,localName);
    		_removeNamedNode(this._ownerElement,this,attr);
    		return attr;
    	},
    	getNamedItemNS: function(namespaceURI, localName) {
    		var i = this.length;
    		while(i--){
    			var node = this[i];
    			if(node.localName == localName && node.namespaceURI == namespaceURI){
    				return node;
    			}
    		}
    		return null;
    	}
    };

    /**
     * The DOMImplementation interface represents an object providing methods
     * which are not dependent on any particular document.
     * Such an object is returned by the `Document.implementation` property.
     *
     * __The individual methods describe the differences compared to the specs.__
     *
     * @constructor
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation MDN
     * @see https://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490 DOM Level 1 Core (Initial)
     * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-102161490 DOM Level 2 Core
     * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-102161490 DOM Level 3 Core
     * @see https://dom.spec.whatwg.org/#domimplementation DOM Living Standard
     */
    function DOMImplementation$1() {
    }

    DOMImplementation$1.prototype = {
    	/**
    	 * The DOMImplementation.hasFeature() method returns a Boolean flag indicating if a given feature is supported.
    	 * The different implementations fairly diverged in what kind of features were reported.
    	 * The latest version of the spec settled to force this method to always return true, where the functionality was accurate and in use.
    	 *
    	 * @deprecated It is deprecated and modern browsers return true in all cases.
    	 *
    	 * @param {string} feature
    	 * @param {string} [version]
    	 * @returns {boolean} always true
    	 *
    	 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/hasFeature MDN
    	 * @see https://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-5CED94D7 DOM Level 1 Core
    	 * @see https://dom.spec.whatwg.org/#dom-domimplementation-hasfeature DOM Living Standard
    	 */
    	hasFeature: function(feature, version) {
    			return true;
    	},
    	/**
    	 * Creates an XML Document object of the specified type with its document element.
    	 *
    	 * __It behaves slightly different from the description in the living standard__:
    	 * - There is no interface/class `XMLDocument`, it returns a `Document` instance.
    	 * - `contentType`, `encoding`, `mode`, `origin`, `url` fields are currently not declared.
    	 * - this implementation is not validating names or qualified names
    	 *   (when parsing XML strings, the SAX parser takes care of that)
    	 *
    	 * @param {string|null} namespaceURI
    	 * @param {string} qualifiedName
    	 * @param {DocumentType=null} doctype
    	 * @returns {Document}
    	 *
    	 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocument MDN
    	 * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocument DOM Level 2 Core (initial)
    	 * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument  DOM Level 2 Core
    	 *
    	 * @see https://dom.spec.whatwg.org/#validate-and-extract DOM: Validate and extract
    	 * @see https://www.w3.org/TR/xml/#NT-NameStartChar XML Spec: Names
    	 * @see https://www.w3.org/TR/xml-names/#ns-qualnames XML Namespaces: Qualified names
    	 */
    	createDocument: function(namespaceURI,  qualifiedName, doctype){
    		var doc = new Document();
    		doc.implementation = this;
    		doc.childNodes = new NodeList();
    		doc.doctype = doctype || null;
    		if (doctype){
    			doc.appendChild(doctype);
    		}
    		if (qualifiedName){
    			var root = doc.createElementNS(namespaceURI, qualifiedName);
    			doc.appendChild(root);
    		}
    		return doc;
    	},
    	/**
    	 * Returns a doctype, with the given `qualifiedName`, `publicId`, and `systemId`.
    	 *
    	 * __This behavior is slightly different from the in the specs__:
    	 * - this implementation is not validating names or qualified names
    	 *   (when parsing XML strings, the SAX parser takes care of that)
    	 *
    	 * @param {string} qualifiedName
    	 * @param {string} [publicId]
    	 * @param {string} [systemId]
    	 * @returns {DocumentType} which can either be used with `DOMImplementation.createDocument` upon document creation
    	 * 				  or can be put into the document via methods like `Node.insertBefore()` or `Node.replaceChild()`
    	 *
    	 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocumentType MDN
    	 * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocType DOM Level 2 Core
    	 * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocumenttype DOM Living Standard
    	 *
    	 * @see https://dom.spec.whatwg.org/#validate-and-extract DOM: Validate and extract
    	 * @see https://www.w3.org/TR/xml/#NT-NameStartChar XML Spec: Names
    	 * @see https://www.w3.org/TR/xml-names/#ns-qualnames XML Namespaces: Qualified names
    	 */
    	createDocumentType: function(qualifiedName, publicId, systemId){
    		var node = new DocumentType();
    		node.name = qualifiedName;
    		node.nodeName = qualifiedName;
    		node.publicId = publicId || '';
    		node.systemId = systemId || '';

    		return node;
    	}
    };


    /**
     * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
     */

    function Node() {
    }
    Node.prototype = {
    	firstChild : null,
    	lastChild : null,
    	previousSibling : null,
    	nextSibling : null,
    	attributes : null,
    	parentNode : null,
    	childNodes : null,
    	ownerDocument : null,
    	nodeValue : null,
    	namespaceURI : null,
    	prefix : null,
    	localName : null,
    	// Modified in DOM Level 2:
    	insertBefore:function(newChild, refChild){//raises 
    		return _insertBefore(this,newChild,refChild);
    	},
    	replaceChild:function(newChild, oldChild){//raises 
    		this.insertBefore(newChild,oldChild);
    		if(oldChild){
    			this.removeChild(oldChild);
    		}
    	},
    	removeChild:function(oldChild){
    		return _removeChild(this,oldChild);
    	},
    	appendChild:function(newChild){
    		return this.insertBefore(newChild,null);
    	},
    	hasChildNodes:function(){
    		return this.firstChild != null;
    	},
    	cloneNode:function(deep){
    		return cloneNode(this.ownerDocument||this,this,deep);
    	},
    	// Modified in DOM Level 2:
    	normalize:function(){
    		var child = this.firstChild;
    		while(child){
    			var next = child.nextSibling;
    			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
    				this.removeChild(next);
    				child.appendData(next.data);
    			}else {
    				child.normalize();
    				child = next;
    			}
    		}
    	},
      	// Introduced in DOM Level 2:
    	isSupported:function(feature, version){
    		return this.ownerDocument.implementation.hasFeature(feature,version);
    	},
        // Introduced in DOM Level 2:
        hasAttributes:function(){
        	return this.attributes.length>0;
        },
        lookupPrefix:function(namespaceURI){
        	var el = this;
        	while(el){
        		var map = el._nsMap;
        		//console.dir(map)
        		if(map){
        			for(var n in map){
        				if(map[n] == namespaceURI){
        					return n;
        				}
        			}
        		}
        		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
        	}
        	return null;
        },
        // Introduced in DOM Level 3:
        lookupNamespaceURI:function(prefix){
        	var el = this;
        	while(el){
        		var map = el._nsMap;
        		//console.dir(map)
        		if(map){
        			if(prefix in map){
        				return map[prefix] ;
        			}
        		}
        		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
        	}
        	return null;
        },
        // Introduced in DOM Level 3:
        isDefaultNamespace:function(namespaceURI){
        	var prefix = this.lookupPrefix(namespaceURI);
        	return prefix == null;
        }
    };


    function _xmlEncoder(c){
    	return c == '<' && '&lt;' ||
             c == '>' && '&gt;' ||
             c == '&' && '&amp;' ||
             c == '"' && '&quot;' ||
             '&#'+c.charCodeAt()+';'
    }


    copy(NodeType,Node);
    copy(NodeType,Node.prototype);

    /**
     * @param callback return true for continue,false for break
     * @return boolean true: break visit;
     */
    function _visitNode(node,callback){
    	if(callback(node)){
    		return true;
    	}
    	if(node = node.firstChild){
    		do{
    			if(_visitNode(node,callback)){return true}
            }while(node=node.nextSibling)
        }
    }



    function Document(){
    }

    function _onAddAttribute(doc,el,newAttr){
    	doc && doc._inc++;
    	var ns = newAttr.namespaceURI ;
    	if(ns === NAMESPACE$1.XMLNS){
    		//update namespace
    		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value;
    	}
    }

    function _onRemoveAttribute(doc,el,newAttr,remove){
    	doc && doc._inc++;
    	var ns = newAttr.namespaceURI ;
    	if(ns === NAMESPACE$1.XMLNS){
    		//update namespace
    		delete el._nsMap[newAttr.prefix?newAttr.localName:''];
    	}
    }

    function _onUpdateChild(doc,el,newChild){
    	if(doc && doc._inc){
    		doc._inc++;
    		//update childNodes
    		var cs = el.childNodes;
    		if(newChild){
    			cs[cs.length++] = newChild;
    		}else {
    			//console.log(1)
    			var child = el.firstChild;
    			var i = 0;
    			while(child){
    				cs[i++] = child;
    				child =child.nextSibling;
    			}
    			cs.length = i;
    		}
    	}
    }

    /**
     * attributes;
     * children;
     * 
     * writeable properties:
     * nodeValue,Attr:value,CharacterData:data
     * prefix
     */
    function _removeChild(parentNode,child){
    	var previous = child.previousSibling;
    	var next = child.nextSibling;
    	if(previous){
    		previous.nextSibling = next;
    	}else {
    		parentNode.firstChild = next;
    	}
    	if(next){
    		next.previousSibling = previous;
    	}else {
    		parentNode.lastChild = previous;
    	}
    	_onUpdateChild(parentNode.ownerDocument,parentNode);
    	return child;
    }
    /**
     * preformance key(refChild == null)
     */
    function _insertBefore(parentNode,newChild,nextChild){
    	var cp = newChild.parentNode;
    	if(cp){
    		cp.removeChild(newChild);//remove and update
    	}
    	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
    		var newFirst = newChild.firstChild;
    		if (newFirst == null) {
    			return newChild;
    		}
    		var newLast = newChild.lastChild;
    	}else {
    		newFirst = newLast = newChild;
    	}
    	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

    	newFirst.previousSibling = pre;
    	newLast.nextSibling = nextChild;
    	
    	
    	if(pre){
    		pre.nextSibling = newFirst;
    	}else {
    		parentNode.firstChild = newFirst;
    	}
    	if(nextChild == null){
    		parentNode.lastChild = newLast;
    	}else {
    		nextChild.previousSibling = newLast;
    	}
    	do{
    		newFirst.parentNode = parentNode;
    	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
    	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
    	//console.log(parentNode.lastChild.nextSibling == null)
    	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
    		newChild.firstChild = newChild.lastChild = null;
    	}
    	return newChild;
    }
    function _appendSingleChild(parentNode,newChild){
    	var cp = newChild.parentNode;
    	if(cp){
    		var pre = parentNode.lastChild;
    		cp.removeChild(newChild);//remove and update
    		var pre = parentNode.lastChild;
    	}
    	var pre = parentNode.lastChild;
    	newChild.parentNode = parentNode;
    	newChild.previousSibling = pre;
    	newChild.nextSibling = null;
    	if(pre){
    		pre.nextSibling = newChild;
    	}else {
    		parentNode.firstChild = newChild;
    	}
    	parentNode.lastChild = newChild;
    	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
    	return newChild;
    	//console.log("__aa",parentNode.lastChild.nextSibling == null)
    }
    Document.prototype = {
    	//implementation : null,
    	nodeName :  '#document',
    	nodeType :  DOCUMENT_NODE,
    	doctype :  null,
    	documentElement :  null,
    	_inc : 1,

    	insertBefore :  function(newChild, refChild){//raises
    		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
    			var child = newChild.firstChild;
    			while(child){
    				var next = child.nextSibling;
    				this.insertBefore(child,refChild);
    				child = next;
    			}
    			return newChild;
    		}
    		if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
    			this.documentElement = newChild;
    		}

    		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
    	},
    	removeChild :  function(oldChild){
    		if(this.documentElement == oldChild){
    			this.documentElement = null;
    		}
    		return _removeChild(this,oldChild);
    	},
    	// Introduced in DOM Level 2:
    	importNode : function(importedNode,deep){
    		return importNode(this,importedNode,deep);
    	},
    	// Introduced in DOM Level 2:
    	getElementById :	function(id){
    		var rtv = null;
    		_visitNode(this.documentElement,function(node){
    			if(node.nodeType == ELEMENT_NODE){
    				if(node.getAttribute('id') == id){
    					rtv = node;
    					return true;
    				}
    			}
    		});
    		return rtv;
    	},

    	/**
    	 * The `getElementsByClassName` method of `Document` interface returns an array-like object
    	 * of all child elements which have **all** of the given class name(s).
    	 *
    	 * Returns an empty list if `classeNames` is an empty string or only contains HTML white space characters.
    	 *
    	 *
    	 * Warning: This is a live LiveNodeList.
    	 * Changes in the DOM will reflect in the array as the changes occur.
    	 * If an element selected by this array no longer qualifies for the selector,
    	 * it will automatically be removed. Be aware of this for iteration purposes.
    	 *
    	 * @param {string} classNames is a string representing the class name(s) to match; multiple class names are separated by (ASCII-)whitespace
    	 *
    	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
    	 * @see https://dom.spec.whatwg.org/#concept-getelementsbyclassname
    	 */
    	getElementsByClassName: function(classNames) {
    		var classNamesSet = toOrderedSet(classNames);
    		return new LiveNodeList(this, function(base) {
    			var ls = [];
    			if (classNamesSet.length > 0) {
    				_visitNode(base.documentElement, function(node) {
    					if(node !== base && node.nodeType === ELEMENT_NODE) {
    						var nodeClassNames = node.getAttribute('class');
    						// can be null if the attribute does not exist
    						if (nodeClassNames) {
    							// before splitting and iterating just compare them for the most common case
    							var matches = classNames === nodeClassNames;
    							if (!matches) {
    								var nodeClassNamesSet = toOrderedSet(nodeClassNames);
    								matches = classNamesSet.every(arrayIncludes(nodeClassNamesSet));
    							}
    							if(matches) {
    								ls.push(node);
    							}
    						}
    					}
    				});
    			}
    			return ls;
    		});
    	},

    	//document factory method:
    	createElement :	function(tagName){
    		var node = new Element();
    		node.ownerDocument = this;
    		node.nodeName = tagName;
    		node.tagName = tagName;
    		node.localName = tagName;
    		node.childNodes = new NodeList();
    		var attrs	= node.attributes = new NamedNodeMap();
    		attrs._ownerElement = node;
    		return node;
    	},
    	createDocumentFragment :	function(){
    		var node = new DocumentFragment();
    		node.ownerDocument = this;
    		node.childNodes = new NodeList();
    		return node;
    	},
    	createTextNode :	function(data){
    		var node = new Text();
    		node.ownerDocument = this;
    		node.appendData(data);
    		return node;
    	},
    	createComment :	function(data){
    		var node = new Comment();
    		node.ownerDocument = this;
    		node.appendData(data);
    		return node;
    	},
    	createCDATASection :	function(data){
    		var node = new CDATASection();
    		node.ownerDocument = this;
    		node.appendData(data);
    		return node;
    	},
    	createProcessingInstruction :	function(target,data){
    		var node = new ProcessingInstruction();
    		node.ownerDocument = this;
    		node.tagName = node.target = target;
    		node.nodeValue= node.data = data;
    		return node;
    	},
    	createAttribute :	function(name){
    		var node = new Attr();
    		node.ownerDocument	= this;
    		node.name = name;
    		node.nodeName	= name;
    		node.localName = name;
    		node.specified = true;
    		return node;
    	},
    	createEntityReference :	function(name){
    		var node = new EntityReference();
    		node.ownerDocument	= this;
    		node.nodeName	= name;
    		return node;
    	},
    	// Introduced in DOM Level 2:
    	createElementNS :	function(namespaceURI,qualifiedName){
    		var node = new Element();
    		var pl = qualifiedName.split(':');
    		var attrs	= node.attributes = new NamedNodeMap();
    		node.childNodes = new NodeList();
    		node.ownerDocument = this;
    		node.nodeName = qualifiedName;
    		node.tagName = qualifiedName;
    		node.namespaceURI = namespaceURI;
    		if(pl.length == 2){
    			node.prefix = pl[0];
    			node.localName = pl[1];
    		}else {
    			//el.prefix = null;
    			node.localName = qualifiedName;
    		}
    		attrs._ownerElement = node;
    		return node;
    	},
    	// Introduced in DOM Level 2:
    	createAttributeNS :	function(namespaceURI,qualifiedName){
    		var node = new Attr();
    		var pl = qualifiedName.split(':');
    		node.ownerDocument = this;
    		node.nodeName = qualifiedName;
    		node.name = qualifiedName;
    		node.namespaceURI = namespaceURI;
    		node.specified = true;
    		if(pl.length == 2){
    			node.prefix = pl[0];
    			node.localName = pl[1];
    		}else {
    			//el.prefix = null;
    			node.localName = qualifiedName;
    		}
    		return node;
    	}
    };
    _extends(Document,Node);


    function Element() {
    	this._nsMap = {};
    }Element.prototype = {
    	nodeType : ELEMENT_NODE,
    	hasAttribute : function(name){
    		return this.getAttributeNode(name)!=null;
    	},
    	getAttribute : function(name){
    		var attr = this.getAttributeNode(name);
    		return attr && attr.value || '';
    	},
    	getAttributeNode : function(name){
    		return this.attributes.getNamedItem(name);
    	},
    	setAttribute : function(name, value){
    		var attr = this.ownerDocument.createAttribute(name);
    		attr.value = attr.nodeValue = "" + value;
    		this.setAttributeNode(attr);
    	},
    	removeAttribute : function(name){
    		var attr = this.getAttributeNode(name);
    		attr && this.removeAttributeNode(attr);
    	},
    	
    	//four real opeartion method
    	appendChild:function(newChild){
    		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
    			return this.insertBefore(newChild,null);
    		}else {
    			return _appendSingleChild(this,newChild);
    		}
    	},
    	setAttributeNode : function(newAttr){
    		return this.attributes.setNamedItem(newAttr);
    	},
    	setAttributeNodeNS : function(newAttr){
    		return this.attributes.setNamedItemNS(newAttr);
    	},
    	removeAttributeNode : function(oldAttr){
    		//console.log(this == oldAttr.ownerElement)
    		return this.attributes.removeNamedItem(oldAttr.nodeName);
    	},
    	//get real attribute name,and remove it by removeAttributeNode
    	removeAttributeNS : function(namespaceURI, localName){
    		var old = this.getAttributeNodeNS(namespaceURI, localName);
    		old && this.removeAttributeNode(old);
    	},
    	
    	hasAttributeNS : function(namespaceURI, localName){
    		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
    	},
    	getAttributeNS : function(namespaceURI, localName){
    		var attr = this.getAttributeNodeNS(namespaceURI, localName);
    		return attr && attr.value || '';
    	},
    	setAttributeNS : function(namespaceURI, qualifiedName, value){
    		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
    		attr.value = attr.nodeValue = "" + value;
    		this.setAttributeNode(attr);
    	},
    	getAttributeNodeNS : function(namespaceURI, localName){
    		return this.attributes.getNamedItemNS(namespaceURI, localName);
    	},
    	
    	getElementsByTagName : function(tagName){
    		return new LiveNodeList(this,function(base){
    			var ls = [];
    			_visitNode(base,function(node){
    				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
    					ls.push(node);
    				}
    			});
    			return ls;
    		});
    	},
    	getElementsByTagNameNS : function(namespaceURI, localName){
    		return new LiveNodeList(this,function(base){
    			var ls = [];
    			_visitNode(base,function(node){
    				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
    					ls.push(node);
    				}
    			});
    			return ls;
    			
    		});
    	}
    };
    Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
    Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


    _extends(Element,Node);
    function Attr() {
    }Attr.prototype.nodeType = ATTRIBUTE_NODE;
    _extends(Attr,Node);


    function CharacterData() {
    }CharacterData.prototype = {
    	data : '',
    	substringData : function(offset, count) {
    		return this.data.substring(offset, offset+count);
    	},
    	appendData: function(text) {
    		text = this.data+text;
    		this.nodeValue = this.data = text;
    		this.length = text.length;
    	},
    	insertData: function(offset,text) {
    		this.replaceData(offset,0,text);
    	
    	},
    	appendChild:function(newChild){
    		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
    	},
    	deleteData: function(offset, count) {
    		this.replaceData(offset,count,"");
    	},
    	replaceData: function(offset, count, text) {
    		var start = this.data.substring(0,offset);
    		var end = this.data.substring(offset+count);
    		text = start + text + end;
    		this.nodeValue = this.data = text;
    		this.length = text.length;
    	}
    };
    _extends(CharacterData,Node);
    function Text() {
    }Text.prototype = {
    	nodeName : "#text",
    	nodeType : TEXT_NODE,
    	splitText : function(offset) {
    		var text = this.data;
    		var newText = text.substring(offset);
    		text = text.substring(0, offset);
    		this.data = this.nodeValue = text;
    		this.length = text.length;
    		var newNode = this.ownerDocument.createTextNode(newText);
    		if(this.parentNode){
    			this.parentNode.insertBefore(newNode, this.nextSibling);
    		}
    		return newNode;
    	}
    };
    _extends(Text,CharacterData);
    function Comment() {
    }Comment.prototype = {
    	nodeName : "#comment",
    	nodeType : COMMENT_NODE
    };
    _extends(Comment,CharacterData);

    function CDATASection() {
    }CDATASection.prototype = {
    	nodeName : "#cdata-section",
    	nodeType : CDATA_SECTION_NODE
    };
    _extends(CDATASection,CharacterData);


    function DocumentType() {
    }DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
    _extends(DocumentType,Node);

    function Notation() {
    }Notation.prototype.nodeType = NOTATION_NODE;
    _extends(Notation,Node);

    function Entity() {
    }Entity.prototype.nodeType = ENTITY_NODE;
    _extends(Entity,Node);

    function EntityReference() {
    }EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
    _extends(EntityReference,Node);

    function DocumentFragment() {
    }DocumentFragment.prototype.nodeName =	"#document-fragment";
    DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
    _extends(DocumentFragment,Node);


    function ProcessingInstruction() {
    }
    ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
    _extends(ProcessingInstruction,Node);
    function XMLSerializer(){}
    XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
    	return nodeSerializeToString.call(node,isHtml,nodeFilter);
    };
    Node.prototype.toString = nodeSerializeToString;
    function nodeSerializeToString(isHtml,nodeFilter){
    	var buf = [];
    	var refNode = this.nodeType == 9 && this.documentElement || this;
    	var prefix = refNode.prefix;
    	var uri = refNode.namespaceURI;
    	
    	if(uri && prefix == null){
    		//console.log(prefix)
    		var prefix = refNode.lookupPrefix(uri);
    		if(prefix == null){
    			//isHTML = true;
    			var visibleNamespaces=[
    			{namespace:uri,prefix:null}
    			//{namespace:uri,prefix:''}
    			];
    		}
    	}
    	serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
    	//console.log('###',this.nodeType,uri,prefix,buf.join(''))
    	return buf.join('');
    }

    function needNamespaceDefine(node, isHTML, visibleNamespaces) {
    	var prefix = node.prefix || '';
    	var uri = node.namespaceURI;
    	// According to [Namespaces in XML 1.0](https://www.w3.org/TR/REC-xml-names/#ns-using) ,
    	// and more specifically https://www.w3.org/TR/REC-xml-names/#nsc-NoPrefixUndecl :
    	// > In a namespace declaration for a prefix [...], the attribute value MUST NOT be empty.
    	// in a similar manner [Namespaces in XML 1.1](https://www.w3.org/TR/xml-names11/#ns-using)
    	// and more specifically https://www.w3.org/TR/xml-names11/#nsc-NSDeclared :
    	// > [...] Furthermore, the attribute value [...] must not be an empty string.
    	// so serializing empty namespace value like xmlns:ds="" would produce an invalid XML document.
    	if (!uri) {
    		return false;
    	}
    	if (prefix === "xml" && uri === NAMESPACE$1.XML || uri === NAMESPACE$1.XMLNS) {
    		return false;
    	}
    	
    	var i = visibleNamespaces.length; 
    	while (i--) {
    		var ns = visibleNamespaces[i];
    		// get namespace prefix
    		if (ns.prefix === prefix) {
    			return ns.namespace !== uri;
    		}
    	}
    	return true;
    }
    /**
     * Well-formed constraint: No < in Attribute Values
     * The replacement text of any entity referred to directly or indirectly in an attribute value must not contain a <.
     * @see https://www.w3.org/TR/xml/#CleanAttrVals
     * @see https://www.w3.org/TR/xml/#NT-AttValue
     */
    function addSerializedAttribute(buf, qualifiedName, value) {
    	buf.push(' ', qualifiedName, '="', value.replace(/[<&"]/g,_xmlEncoder), '"');
    }

    function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
    	if (!visibleNamespaces) {
    		visibleNamespaces = [];
    	}

    	if(nodeFilter){
    		node = nodeFilter(node);
    		if(node){
    			if(typeof node == 'string'){
    				buf.push(node);
    				return;
    			}
    		}else {
    			return;
    		}
    		//buf.sort.apply(attrs, attributeSorter);
    	}

    	switch(node.nodeType){
    	case ELEMENT_NODE:
    		var attrs = node.attributes;
    		var len = attrs.length;
    		var child = node.firstChild;
    		var nodeName = node.tagName;
    		
    		isHTML = NAMESPACE$1.isHTML(node.namespaceURI) || isHTML;

    		var prefixedNodeName = nodeName;
    		if (!isHTML && !node.prefix && node.namespaceURI) {
    			var defaultNS;
    			for (var ai = 0; ai < attrs.length; ai++) {
    				if (attrs.item(ai).name === 'xmlns') {
    					defaultNS = attrs.item(ai).value;
    					break
    				}
    			}
    			if (defaultNS !== node.namespaceURI) {
    				for (var nsi = visibleNamespaces.length - 1; nsi >= 0; nsi--) {
    					var namespace = visibleNamespaces[nsi];
    					if (namespace.namespace === node.namespaceURI) {
    						if (namespace.prefix) {
    							prefixedNodeName = namespace.prefix + ':' + nodeName;
    						}
    						break
    					}
    				}
    			}
    		}

    		buf.push('<', prefixedNodeName);

    		for(var i=0;i<len;i++){
    			// add namespaces for attributes
    			var attr = attrs.item(i);
    			if (attr.prefix == 'xmlns') {
    				visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
    			}else if(attr.nodeName == 'xmlns'){
    				visibleNamespaces.push({ prefix: '', namespace: attr.value });
    			}
    		}

    		for(var i=0;i<len;i++){
    			var attr = attrs.item(i);
    			if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
    				var prefix = attr.prefix||'';
    				var uri = attr.namespaceURI;
    				addSerializedAttribute(buf, prefix ? 'xmlns:' + prefix : "xmlns", uri);
    				visibleNamespaces.push({ prefix: prefix, namespace:uri });
    			}
    			serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
    		}

    		// add namespace for current node		
    		if (nodeName === prefixedNodeName && needNamespaceDefine(node, isHTML, visibleNamespaces)) {
    			var prefix = node.prefix||'';
    			var uri = node.namespaceURI;
    			addSerializedAttribute(buf, prefix ? 'xmlns:' + prefix : "xmlns", uri);
    			visibleNamespaces.push({ prefix: prefix, namespace:uri });
    		}
    		
    		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
    			buf.push('>');
    			//if is cdata child node
    			if(isHTML && /^script$/i.test(nodeName)){
    				while(child){
    					if(child.data){
    						buf.push(child.data);
    					}else {
    						serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces.slice());
    					}
    					child = child.nextSibling;
    				}
    			}else
    			{
    				while(child){
    					serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces.slice());
    					child = child.nextSibling;
    				}
    			}
    			buf.push('</',prefixedNodeName,'>');
    		}else {
    			buf.push('/>');
    		}
    		// remove added visible namespaces
    		//visibleNamespaces.length = startVisibleNamespaces;
    		return;
    	case DOCUMENT_NODE:
    	case DOCUMENT_FRAGMENT_NODE:
    		var child = node.firstChild;
    		while(child){
    			serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces.slice());
    			child = child.nextSibling;
    		}
    		return;
    	case ATTRIBUTE_NODE:
    		return addSerializedAttribute(buf, node.name, node.value);
    	case TEXT_NODE:
    		/**
    		 * The ampersand character (&) and the left angle bracket (<) must not appear in their literal form,
    		 * except when used as markup delimiters, or within a comment, a processing instruction, or a CDATA section.
    		 * If they are needed elsewhere, they must be escaped using either numeric character references or the strings
    		 * `&amp;` and `&lt;` respectively.
    		 * The right angle bracket (>) may be represented using the string " &gt; ", and must, for compatibility,
    		 * be escaped using either `&gt;` or a character reference when it appears in the string `]]>` in content,
    		 * when that string is not marking the end of a CDATA section.
    		 *
    		 * In the content of elements, character data is any string of characters
    		 * which does not contain the start-delimiter of any markup
    		 * and does not include the CDATA-section-close delimiter, `]]>`.
    		 *
    		 * @see https://www.w3.org/TR/xml/#NT-CharData
    		 */
    		return buf.push(node.data
    			.replace(/[<&]/g,_xmlEncoder)
    			.replace(/]]>/g, ']]&gt;')
    		);
    	case CDATA_SECTION_NODE:
    		return buf.push( '<![CDATA[',node.data,']]>');
    	case COMMENT_NODE:
    		return buf.push( "<!--",node.data,"-->");
    	case DOCUMENT_TYPE_NODE:
    		var pubid = node.publicId;
    		var sysid = node.systemId;
    		buf.push('<!DOCTYPE ',node.name);
    		if(pubid){
    			buf.push(' PUBLIC ', pubid);
    			if (sysid && sysid!='.') {
    				buf.push(' ', sysid);
    			}
    			buf.push('>');
    		}else if(sysid && sysid!='.'){
    			buf.push(' SYSTEM ', sysid, '>');
    		}else {
    			var sub = node.internalSubset;
    			if(sub){
    				buf.push(" [",sub,"]");
    			}
    			buf.push(">");
    		}
    		return;
    	case PROCESSING_INSTRUCTION_NODE:
    		return buf.push( "<?",node.target," ",node.data,"?>");
    	case ENTITY_REFERENCE_NODE:
    		return buf.push( '&',node.nodeName,';');
    	//case ENTITY_NODE:
    	//case NOTATION_NODE:
    	default:
    		buf.push('??',node.nodeName);
    	}
    }
    function importNode(doc,node,deep){
    	var node2;
    	switch (node.nodeType) {
    	case ELEMENT_NODE:
    		node2 = node.cloneNode(false);
    		node2.ownerDocument = doc;
    		//var attrs = node2.attributes;
    		//var len = attrs.length;
    		//for(var i=0;i<len;i++){
    			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
    		//}
    	case DOCUMENT_FRAGMENT_NODE:
    		break;
    	case ATTRIBUTE_NODE:
    		deep = true;
    		break;
    	//case ENTITY_REFERENCE_NODE:
    	//case PROCESSING_INSTRUCTION_NODE:
    	////case TEXT_NODE:
    	//case CDATA_SECTION_NODE:
    	//case COMMENT_NODE:
    	//	deep = false;
    	//	break;
    	//case DOCUMENT_NODE:
    	//case DOCUMENT_TYPE_NODE:
    	//cannot be imported.
    	//case ENTITY_NODE:
    	//case NOTATION_NODE：
    	//can not hit in level3
    	//default:throw e;
    	}
    	if(!node2){
    		node2 = node.cloneNode(false);//false
    	}
    	node2.ownerDocument = doc;
    	node2.parentNode = null;
    	if(deep){
    		var child = node.firstChild;
    		while(child){
    			node2.appendChild(importNode(doc,child,deep));
    			child = child.nextSibling;
    		}
    	}
    	return node2;
    }
    //
    //var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
    //					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
    function cloneNode(doc,node,deep){
    	var node2 = new node.constructor();
    	for(var n in node){
    		var v = node[n];
    		if(typeof v != 'object' ){
    			if(v != node2[n]){
    				node2[n] = v;
    			}
    		}
    	}
    	if(node.childNodes){
    		node2.childNodes = new NodeList();
    	}
    	node2.ownerDocument = doc;
    	switch (node2.nodeType) {
    	case ELEMENT_NODE:
    		var attrs	= node.attributes;
    		var attrs2	= node2.attributes = new NamedNodeMap();
    		var len = attrs.length;
    		attrs2._ownerElement = node2;
    		for(var i=0;i<len;i++){
    			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
    		}
    		break;	case ATTRIBUTE_NODE:
    		deep = true;
    	}
    	if(deep){
    		var child = node.firstChild;
    		while(child){
    			node2.appendChild(cloneNode(doc,child,deep));
    			child = child.nextSibling;
    		}
    	}
    	return node2;
    }

    function __set__(object,key,value){
    	object[key] = value;
    }
    //do dynamic
    try{
    	if(Object.defineProperty){
    		Object.defineProperty(LiveNodeList.prototype,'length',{
    			get:function(){
    				_updateLiveList(this);
    				return this.$$length;
    			}
    		});

    		Object.defineProperty(Node.prototype,'textContent',{
    			get:function(){
    				return getTextContent(this);
    			},

    			set:function(data){
    				switch(this.nodeType){
    				case ELEMENT_NODE:
    				case DOCUMENT_FRAGMENT_NODE:
    					while(this.firstChild){
    						this.removeChild(this.firstChild);
    					}
    					if(data || String(data)){
    						this.appendChild(this.ownerDocument.createTextNode(data));
    					}
    					break;

    				default:
    					this.data = data;
    					this.value = data;
    					this.nodeValue = data;
    				}
    			}
    		});
    		
    		function getTextContent(node){
    			switch(node.nodeType){
    			case ELEMENT_NODE:
    			case DOCUMENT_FRAGMENT_NODE:
    				var buf = [];
    				node = node.firstChild;
    				while(node){
    					if(node.nodeType!==7 && node.nodeType !==8){
    						buf.push(getTextContent(node));
    					}
    					node = node.nextSibling;
    				}
    				return buf.join('');
    			default:
    				return node.nodeValue;
    			}
    		}

    		__set__ = function(object,key,value){
    			//console.log(value)
    			object['$$'+key] = value;
    		};
    	}
    }catch(e){//ie8
    }

    //if(typeof require == 'function'){
    	dom.DocumentType = DocumentType;
    	dom.DOMException = DOMException;
    	dom.DOMImplementation = DOMImplementation$1;
    	dom.Element = Element;
    	dom.Node = Node;
    	dom.NodeList = NodeList;
    	dom.XMLSerializer = XMLSerializer;

    var conventions = conventions$2;
    var entities = entities$1;

    var NAMESPACE = conventions.NAMESPACE;

    function DOMParser(options){
    	this.options = options ||{locator:{}};
    }

    DOMParser.prototype.parseFromString = function(source,mimeType){
    	var options = this.options;
    	var sax =  new XMLReader();
    	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
    	var errorHandler = options.errorHandler;
    	var locator = options.locator;
    	var defaultNSMap = options.xmlns||{};
    	var isHTML = /\/x?html?$/.test(mimeType);//mimeType.toLowerCase().indexOf('html') > -1;
      	var entityMap = isHTML ? entities.HTML_ENTITIES : entities.XML_ENTITIES;
    	if(locator){
    		domBuilder.setDocumentLocator(locator);
    	}

    	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
    	sax.domBuilder = options.domBuilder || domBuilder;
    	if(isHTML){
    		defaultNSMap[''] = NAMESPACE.HTML;
    	}
    	defaultNSMap.xml = defaultNSMap.xml || NAMESPACE.XML;
    	if(source && typeof source === 'string'){
    		sax.parse(source,defaultNSMap,entityMap);
    	}else {
    		sax.errorHandler.error("invalid doc source");
    	}
    	return domBuilder.doc;
    };
    function buildErrorHandler(errorImpl,domBuilder,locator){
    	if(!errorImpl){
    		if(domBuilder instanceof DOMHandler){
    			return domBuilder;
    		}
    		errorImpl = domBuilder ;
    	}
    	var errorHandler = {};
    	var isCallback = errorImpl instanceof Function;
    	locator = locator||{};
    	function build(key){
    		var fn = errorImpl[key];
    		if(!fn && isCallback){
    			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg);}:errorImpl;
    		}
    		errorHandler[key] = fn && function(msg){
    			fn('[xmldom '+key+']\t'+msg+_locator(locator));
    		}||function(){};
    	}
    	build('warning');
    	build('error');
    	build('fatalError');
    	return errorHandler;
    }

    //console.log('#\n\n\n\n\n\n\n####')
    /**
     * +ContentHandler+ErrorHandler
     * +LexicalHandler+EntityResolver2
     * -DeclHandler-DTDHandler
     *
     * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
     * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
     * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
     */
    function DOMHandler() {
        this.cdata = false;
    }
    function position(locator,node){
    	node.lineNumber = locator.lineNumber;
    	node.columnNumber = locator.columnNumber;
    }
    /**
     * @see org.xml.sax.ContentHandler#startDocument
     * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
     */
    DOMHandler.prototype = {
    	startDocument : function() {
        	this.doc = new DOMImplementation().createDocument(null, null, null);
        	if (this.locator) {
            	this.doc.documentURI = this.locator.systemId;
        	}
    	},
    	startElement:function(namespaceURI, localName, qName, attrs) {
    		var doc = this.doc;
    	    var el = doc.createElementNS(namespaceURI, qName||localName);
    	    var len = attrs.length;
    	    appendElement(this, el);
    	    this.currentElement = el;

    		this.locator && position(this.locator,el);
    	    for (var i = 0 ; i < len; i++) {
    	        var namespaceURI = attrs.getURI(i);
    	        var value = attrs.getValue(i);
    	        var qName = attrs.getQName(i);
    			var attr = doc.createAttributeNS(namespaceURI, qName);
    			this.locator &&position(attrs.getLocator(i),attr);
    			attr.value = attr.nodeValue = value;
    			el.setAttributeNode(attr);
    	    }
    	},
    	endElement:function(namespaceURI, localName, qName) {
    		var current = this.currentElement;
    		current.tagName;
    		this.currentElement = current.parentNode;
    	},
    	startPrefixMapping:function(prefix, uri) {
    	},
    	endPrefixMapping:function(prefix) {
    	},
    	processingInstruction:function(target, data) {
    	    var ins = this.doc.createProcessingInstruction(target, data);
    	    this.locator && position(this.locator,ins);
    	    appendElement(this, ins);
    	},
    	ignorableWhitespace:function(ch, start, length) {
    	},
    	characters:function(chars, start, length) {
    		chars = _toString.apply(this,arguments);
    		//console.log(chars)
    		if(chars){
    			if (this.cdata) {
    				var charNode = this.doc.createCDATASection(chars);
    			} else {
    				var charNode = this.doc.createTextNode(chars);
    			}
    			if(this.currentElement){
    				this.currentElement.appendChild(charNode);
    			}else if(/^\s*$/.test(chars)){
    				this.doc.appendChild(charNode);
    				//process xml
    			}
    			this.locator && position(this.locator,charNode);
    		}
    	},
    	skippedEntity:function(name) {
    	},
    	endDocument:function() {
    		this.doc.normalize();
    	},
    	setDocumentLocator:function (locator) {
    	    if(this.locator = locator){// && !('lineNumber' in locator)){
    	    	locator.lineNumber = 0;
    	    }
    	},
    	//LexicalHandler
    	comment:function(chars, start, length) {
    		chars = _toString.apply(this,arguments);
    	    var comm = this.doc.createComment(chars);
    	    this.locator && position(this.locator,comm);
    	    appendElement(this, comm);
    	},

    	startCDATA:function() {
    	    //used in characters() methods
    	    this.cdata = true;
    	},
    	endCDATA:function() {
    	    this.cdata = false;
    	},

    	startDTD:function(name, publicId, systemId) {
    		var impl = this.doc.implementation;
    	    if (impl && impl.createDocumentType) {
    	        var dt = impl.createDocumentType(name, publicId, systemId);
    	        this.locator && position(this.locator,dt);
    	        appendElement(this, dt);
    	    }
    	},
    	/**
    	 * @see org.xml.sax.ErrorHandler
    	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
    	 */
    	warning:function(error) {
    		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
    	},
    	error:function(error) {
    		console.error('[xmldom error]\t'+error,_locator(this.locator));
    	},
    	fatalError:function(error) {
    		throw new ParseError(error, this.locator);
    	}
    };
    function _locator(l){
    	if(l){
    		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
    	}
    }
    function _toString(chars,start,length){
    	if(typeof chars == 'string'){
    		return chars.substr(start,length)
    	}else {//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
    		if(chars.length >= start+length || start){
    			return new java.lang.String(chars,start,length)+'';
    		}
    		return chars;
    	}
    }

    /*
     * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
     * used method of org.xml.sax.ext.LexicalHandler:
     *  #comment(chars, start, length)
     *  #startCDATA()
     *  #endCDATA()
     *  #startDTD(name, publicId, systemId)
     *
     *
     * IGNORED method of org.xml.sax.ext.LexicalHandler:
     *  #endDTD()
     *  #startEntity(name)
     *  #endEntity(name)
     *
     *
     * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
     * IGNORED method of org.xml.sax.ext.DeclHandler
     * 	#attributeDecl(eName, aName, type, mode, value)
     *  #elementDecl(name, model)
     *  #externalEntityDecl(name, publicId, systemId)
     *  #internalEntityDecl(name, value)
     * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
     * IGNORED method of org.xml.sax.EntityResolver2
     *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
     *  #resolveEntity(publicId, systemId)
     *  #getExternalSubset(name, baseURI)
     * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
     * IGNORED method of org.xml.sax.DTDHandler
     *  #notationDecl(name, publicId, systemId) {};
     *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
     */
    "endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
    	DOMHandler.prototype[key] = function(){return null};
    });

    /* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
    function appendElement (hander,node) {
        if (!hander.currentElement) {
            hander.doc.appendChild(node);
        } else {
            hander.currentElement.appendChild(node);
        }
    }//appendChild and setAttributeNS are preformance key

    //if(typeof require == 'function'){
    var sax = sax$1;
    var XMLReader = sax.XMLReader;
    var ParseError = sax.ParseError;
    var DOMImplementation = domParser.DOMImplementation = dom.DOMImplementation;
    domParser.XMLSerializer = dom.XMLSerializer ;
    domParser.DOMParser = DOMParser;
    domParser.__DOMHandler = DOMHandler;

    var parseJson$1 = {};

    Object.defineProperty(parseJson$1, "__esModule", { value: true });
    parseJson$1.parseJson = void 0;
    /**
     * Parses a given string into JSON.
     * Gracefully handles invalid JSON by returning `null`.
     */
    function parseJson(data) {
        try {
            var json = JSON.parse(data);
            return json;
        }
        catch (_) {
            return null;
        }
    }
    parseJson$1.parseJson = parseJson;

    var bufferFrom$1 = {};

    Object.defineProperty(bufferFrom$1, "__esModule", { value: true });
    bufferFrom$1.bufferFrom = void 0;
    /**
     * Convert a given string into a `Uint8Array`.
     * We don't use `TextEncoder` because it's unavailable in some environments.
     */
    function bufferFrom(init) {
        var encodedString = encodeURIComponent(init);
        var binaryString = encodedString.replace(/%([0-9A-F]{2})/g, function (_, char) {
            return String.fromCharCode(('0x' + char));
        });
        var buffer = new Uint8Array(binaryString.length);
        Array.prototype.forEach.call(binaryString, function (char, index) {
            buffer[index] = char.charCodeAt(0);
        });
        return buffer;
    }
    bufferFrom$1.bufferFrom = bufferFrom;

    var createEvent$1 = {};

    var EventPolyfill$1 = {};

    Object.defineProperty(EventPolyfill$1, "__esModule", { value: true });
    EventPolyfill$1.EventPolyfill = void 0;
    var EventPolyfill = /** @class */ (function () {
        function EventPolyfill(type, options) {
            this.AT_TARGET = 0;
            this.BUBBLING_PHASE = 0;
            this.CAPTURING_PHASE = 0;
            this.NONE = 0;
            this.type = '';
            this.srcElement = null;
            this.currentTarget = null;
            this.eventPhase = 0;
            this.isTrusted = true;
            this.composed = false;
            this.cancelable = true;
            this.defaultPrevented = false;
            this.bubbles = true;
            this.lengthComputable = true;
            this.loaded = 0;
            this.total = 0;
            this.cancelBubble = false;
            this.returnValue = true;
            this.type = type;
            this.target = (options === null || options === void 0 ? void 0 : options.target) || null;
            this.currentTarget = (options === null || options === void 0 ? void 0 : options.currentTarget) || null;
            this.timeStamp = Date.now();
        }
        EventPolyfill.prototype.composedPath = function () {
            return [];
        };
        EventPolyfill.prototype.initEvent = function (type, bubbles, cancelable) {
            this.type = type;
            this.bubbles = !!bubbles;
            this.cancelable = !!cancelable;
        };
        EventPolyfill.prototype.preventDefault = function () {
            this.defaultPrevented = true;
        };
        EventPolyfill.prototype.stopPropagation = function () { };
        EventPolyfill.prototype.stopImmediatePropagation = function () { };
        return EventPolyfill;
    }());
    EventPolyfill$1.EventPolyfill = EventPolyfill;

    var ProgressEventPolyfill$1 = {};

    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(ProgressEventPolyfill$1, "__esModule", { value: true });
    ProgressEventPolyfill$1.ProgressEventPolyfill = void 0;
    var EventPolyfill_1$1 = EventPolyfill$1;
    var ProgressEventPolyfill = /** @class */ (function (_super) {
        __extends(ProgressEventPolyfill, _super);
        function ProgressEventPolyfill(type, init) {
            var _this = _super.call(this, type) || this;
            _this.lengthComputable = (init === null || init === void 0 ? void 0 : init.lengthComputable) || false;
            _this.composed = (init === null || init === void 0 ? void 0 : init.composed) || false;
            _this.loaded = (init === null || init === void 0 ? void 0 : init.loaded) || 0;
            _this.total = (init === null || init === void 0 ? void 0 : init.total) || 0;
            return _this;
        }
        return ProgressEventPolyfill;
    }(EventPolyfill_1$1.EventPolyfill));
    ProgressEventPolyfill$1.ProgressEventPolyfill = ProgressEventPolyfill;

    Object.defineProperty(createEvent$1, "__esModule", { value: true });
    createEvent$1.createEvent = void 0;
    var EventPolyfill_1 = EventPolyfill$1;
    var ProgressEventPolyfill_1 = ProgressEventPolyfill$1;
    var SUPPORTS_PROGRESS_EVENT = typeof ProgressEvent !== 'undefined';
    function createEvent(target, type, init) {
        var progressEvents = [
            'error',
            'progress',
            'loadstart',
            'loadend',
            'load',
            'timeout',
            'abort',
        ];
        /**
         * `ProgressEvent` is not supported in React Native.
         * @see https://github.com/mswjs/interceptors/issues/40
         */
        var ProgressEventClass = SUPPORTS_PROGRESS_EVENT
            ? ProgressEvent
            : ProgressEventPolyfill_1.ProgressEventPolyfill;
        var event = progressEvents.includes(type)
            ? new ProgressEventClass(type, {
                lengthComputable: true,
                loaded: (init === null || init === void 0 ? void 0 : init.loaded) || 0,
                total: (init === null || init === void 0 ? void 0 : init.total) || 0,
            })
            : new EventPolyfill_1.EventPolyfill(type, {
                target: target,
                currentTarget: target,
            });
        return event;
    }
    createEvent$1.createEvent = createEvent;

    var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (commonjsGlobal && commonjsGlobal.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var __values = (commonjsGlobal && commonjsGlobal.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    Object.defineProperty(XMLHttpRequestOverride, "__esModule", { value: true });
    XMLHttpRequestOverride.createXMLHttpRequestOverride = void 0;
    /**
     * XMLHttpRequest override class.
     * Inspired by https://github.com/marvinhagemeister/xhr-mocklet.
     */
    var until_1 = lib$2;
    var headers_utils_1 = lib$1$1;
    var xmldom_1 = domParser;
    var parseJson_1 = parseJson$1;
    var toIsoResponse_1 = toIsoResponse$1;
    var uuid_1 = uuid;
    var bufferFrom_1 = bufferFrom$1;
    var createEvent_1 = createEvent$1;
    var createDebug = browser;
    var createXMLHttpRequestOverride = function (options) {
        var _a;
        var pureXMLHttpRequest = options.pureXMLHttpRequest, observer = options.observer, resolver = options.resolver;
        var debug = createDebug('XHR');
        return _a = /** @class */ (function () {
                function XMLHttpRequestOverride() {
                    // Collection of events modified by `addEventListener`/`removeEventListener` calls.
                    this._events = [];
                    this.UNSENT = 0;
                    this.OPENED = 1;
                    this.HEADERS_RECEIVED = 2;
                    this.LOADING = 3;
                    this.DONE = 4;
                    this.onreadystatechange = null;
                    /* Events */
                    this.onabort = null;
                    this.onerror = null;
                    this.onload = null;
                    this.onloadend = null;
                    this.onloadstart = null;
                    this.onprogress = null;
                    this.ontimeout = null;
                    this.url = '';
                    this.method = 'GET';
                    this.readyState = this.UNSENT;
                    this.withCredentials = false;
                    this.status = 200;
                    this.statusText = 'OK';
                    this.data = '';
                    this.response = '';
                    this.responseType = 'text';
                    this.responseText = '';
                    this.responseXML = null;
                    this.responseURL = '';
                    this.upload = null;
                    this.timeout = 0;
                    this._requestHeaders = new headers_utils_1.Headers();
                    this._responseHeaders = new headers_utils_1.Headers();
                }
                XMLHttpRequestOverride.prototype.setReadyState = function (nextState) {
                    if (nextState === this.readyState) {
                        return;
                    }
                    debug('readyState change %d -> %d', this.readyState, nextState);
                    this.readyState = nextState;
                    if (nextState !== this.UNSENT) {
                        debug('triggerring readystate change...');
                        this.trigger('readystatechange');
                    }
                };
                /**
                 * Triggers both direct callback and attached event listeners
                 * for the given event.
                 */
                XMLHttpRequestOverride.prototype.trigger = function (eventName, options) {
                    var e_1, _a;
                    debug('trigger "%s" (%d)', eventName, this.readyState);
                    debug('resolve listener for event "%s"', eventName);
                    // @ts-expect-error XMLHttpRequest class has no index signature.
                    var callback = this["on" + eventName];
                    callback === null || callback === void 0 ? void 0 : callback.call(this, createEvent_1.createEvent(this, eventName, options));
                    try {
                        for (var _b = __values(this._events), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var event_1 = _c.value;
                            if (event_1.name === eventName) {
                                debug('calling mock event listener "%s" (%d)', eventName, this.readyState);
                                event_1.listener.call(this, createEvent_1.createEvent(this, eventName, options));
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    return this;
                };
                XMLHttpRequestOverride.prototype.reset = function () {
                    debug('reset');
                    this.setReadyState(this.UNSENT);
                    this.status = 200;
                    this.statusText = 'OK';
                    this.data = '';
                    this.response = null;
                    this.responseText = null;
                    this.responseXML = null;
                    this._requestHeaders = new headers_utils_1.Headers();
                    this._responseHeaders = new headers_utils_1.Headers();
                };
                XMLHttpRequestOverride.prototype.open = function (method, url, async, user, password) {
                    if (async === void 0) { async = true; }
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            debug = createDebug("XHR " + method + " " + url);
                            debug('open', { method: method, url: url, async: async, user: user, password: password });
                            this.reset();
                            this.setReadyState(this.OPENED);
                            if (typeof url === 'undefined') {
                                this.url = method;
                                this.method = 'GET';
                            }
                            else {
                                this.url = url;
                                this.method = method;
                                this.async = async;
                                this.user = user;
                                this.password = password;
                            }
                            return [2 /*return*/];
                        });
                    });
                };
                XMLHttpRequestOverride.prototype.send = function (data) {
                    var _this = this;
                    debug('send %s %s', this.method, this.url);
                    this.data = data || '';
                    var url;
                    try {
                        url = new URL(this.url);
                    }
                    catch (error) {
                        // Assume a relative URL, if construction of a new `URL` instance fails.
                        // Since `XMLHttpRequest` always executed in a DOM-like environment,
                        // resolve the relative request URL against the current window location.
                        url = new URL(this.url, window.location.href);
                    }
                    debug('request headers', this._requestHeaders);
                    // Create an intercepted request instance exposed to the request intercepting middleware.
                    var isoRequest = {
                        id: uuid_1.uuidv4(),
                        url: url,
                        method: this.method,
                        body: this.data,
                        headers: this._requestHeaders,
                    };
                    observer.emit('request', isoRequest);
                    debug('awaiting mocked response...');
                    Promise.resolve(until_1.until(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, resolver(isoRequest, this)];
                    }); }); })).then(function (_a) {
                        var _b;
                        var _c = __read(_a, 2), middlewareException = _c[0], mockedResponse = _c[1];
                        // When the request middleware throws an exception, error the request.
                        // This cancels the request and is similar to a network error.
                        if (middlewareException) {
                            debug('middleware function threw an exception!', middlewareException);
                            // No way to propagate the actual error message.
                            _this.trigger('error');
                            _this.abort();
                            return;
                        }
                        // Return a mocked response, if provided in the middleware.
                        if (mockedResponse) {
                            debug('received mocked response', mockedResponse);
                            // Trigger a loadstart event to indicate the initialization of the fetch.
                            _this.trigger('loadstart');
                            _this.status = mockedResponse.status || 200;
                            _this.statusText = mockedResponse.statusText || 'OK';
                            _this._responseHeaders = mockedResponse.headers
                                ? headers_utils_1.objectToHeaders(mockedResponse.headers)
                                : new headers_utils_1.Headers();
                            debug('set response status', _this.status, _this.statusText);
                            debug('set response headers', _this._responseHeaders);
                            // Mark that response headers has been received
                            // and trigger a ready state event to reflect received headers
                            // in a custom `onreadystatechange` callback.
                            _this.setReadyState(_this.HEADERS_RECEIVED);
                            debug('response type', _this.responseType);
                            _this.response = _this.getResponseBody(mockedResponse.body);
                            _this.responseText = mockedResponse.body || '';
                            _this.responseXML = _this.getResponseXML();
                            debug('set response body', _this.response);
                            if (mockedResponse.body && _this.response) {
                                _this.setReadyState(_this.LOADING);
                                // Presense of the mocked response implies a response body (not null).
                                // Presense of the coerced `this.response` implies the mocked body is valid.
                                var bodyBuffer = bufferFrom_1.bufferFrom(mockedResponse.body);
                                // Trigger a progress event based on the mocked response body.
                                _this.trigger('progress', {
                                    loaded: bodyBuffer.length,
                                    total: bodyBuffer.length,
                                });
                            }
                            /**
                             * Explicitly mark the request as done so its response never hangs.
                             * @see https://github.com/mswjs/interceptors/issues/13
                             */
                            _this.setReadyState(_this.DONE);
                            // Trigger a load event to indicate the fetch has succeeded.
                            _this.trigger('load');
                            // Trigger a loadend event to indicate the fetch has completed.
                            _this.trigger('loadend');
                            observer.emit('response', isoRequest, toIsoResponse_1.toIsoResponse(mockedResponse));
                        }
                        else {
                            debug('no mocked response received!');
                            // Perform an original request, when the request middleware returned no mocked response.
                            var originalRequest_1 = new pureXMLHttpRequest();
                            debug('opening an original request %s %s', _this.method, _this.url);
                            originalRequest_1.open(_this.method, _this.url, (_b = _this.async) !== null && _b !== void 0 ? _b : true, _this.user, _this.password);
                            // Reflect a successful state of the original request
                            // on the patched instance.
                            originalRequest_1.addEventListener('load', function () {
                                debug('original "onload"');
                                _this.status = originalRequest_1.status;
                                _this.statusText = originalRequest_1.statusText;
                                _this.responseURL = originalRequest_1.responseURL;
                                _this.responseType = originalRequest_1.responseType;
                                _this.response = originalRequest_1.response;
                                _this.responseText = originalRequest_1.responseText;
                                _this.responseXML = originalRequest_1.responseXML;
                                debug('set mock request readyState to DONE');
                                // Explicitly mark the mocked request instance as done
                                // so the response never hangs.
                                /**
                                 * @note `readystatechange` listener is called TWICE
                                 * in the case of unhandled request.
                                 */
                                _this.setReadyState(_this.DONE);
                                debug('received original response', _this.status, _this.statusText);
                                debug('original response body:', _this.response);
                                var responseHeaders = originalRequest_1.getAllResponseHeaders();
                                debug('original response headers:\n', responseHeaders);
                                _this._responseHeaders = headers_utils_1.stringToHeaders(responseHeaders);
                                debug('original response headers (normalized)', _this._responseHeaders);
                                debug('original response finished');
                                observer.emit('response', isoRequest, {
                                    status: originalRequest_1.status,
                                    statusText: originalRequest_1.statusText,
                                    headers: _this._responseHeaders,
                                    body: originalRequest_1.response,
                                });
                            });
                            // Assign callbacks and event listeners from the intercepted XHR instance
                            // to the original XHR instance.
                            _this.propagateCallbacks(originalRequest_1);
                            _this.propagateListeners(originalRequest_1);
                            _this.propagateHeaders(originalRequest_1, _this._requestHeaders);
                            if (_this.async) {
                                originalRequest_1.timeout = _this.timeout;
                            }
                            debug('send', _this.data);
                            originalRequest_1.send(_this.data);
                        }
                    });
                };
                XMLHttpRequestOverride.prototype.abort = function () {
                    debug('abort');
                    if (this.readyState > this.UNSENT && this.readyState < this.DONE) {
                        this.setReadyState(this.UNSENT);
                        this.trigger('abort');
                    }
                };
                XMLHttpRequestOverride.prototype.dispatchEvent = function () {
                    return false;
                };
                XMLHttpRequestOverride.prototype.setRequestHeader = function (name, value) {
                    debug('set request header "%s" to "%s"', name, value);
                    this._requestHeaders.append(name, value);
                };
                XMLHttpRequestOverride.prototype.getResponseHeader = function (name) {
                    debug('get response header "%s"', name);
                    if (this.readyState < this.HEADERS_RECEIVED) {
                        debug('cannot return a header: headers not received (state: %s)', this.readyState);
                        return null;
                    }
                    var headerValue = this._responseHeaders.get(name);
                    debug('resolved response header "%s" to "%s"', name, headerValue, this._responseHeaders);
                    return headerValue;
                };
                XMLHttpRequestOverride.prototype.getAllResponseHeaders = function () {
                    debug('get all response headers');
                    if (this.readyState < this.HEADERS_RECEIVED) {
                        debug('cannot return headers: headers not received (state: %s)', this.readyState);
                        return '';
                    }
                    return headers_utils_1.headersToString(this._responseHeaders);
                };
                XMLHttpRequestOverride.prototype.addEventListener = function (name, listener) {
                    debug('addEventListener', name, listener);
                    this._events.push({
                        name: name,
                        listener: listener,
                    });
                };
                XMLHttpRequestOverride.prototype.removeEventListener = function (name, listener) {
                    debug('removeEventListener', name, listener);
                    this._events = this._events.filter(function (storedEvent) {
                        return storedEvent.name !== name && storedEvent.listener !== listener;
                    });
                };
                XMLHttpRequestOverride.prototype.overrideMimeType = function () { };
                /**
                 * Resolves the response based on the `responseType` value.
                 */
                XMLHttpRequestOverride.prototype.getResponseBody = function (body) {
                    // Handle an improperly set "null" value of the mocked response body.
                    var textBody = body !== null && body !== void 0 ? body : '';
                    debug('coerced response body to', textBody);
                    switch (this.responseType) {
                        case 'json': {
                            debug('resolving response body as JSON');
                            return parseJson_1.parseJson(textBody);
                        }
                        case 'blob': {
                            var blobType = this.getResponseHeader('content-type') || 'text/plain';
                            debug('resolving response body as Blob', { type: blobType });
                            return new Blob([textBody], {
                                type: blobType,
                            });
                        }
                        case 'arraybuffer': {
                            debug('resolving response body as ArrayBuffer');
                            var arrayBuffer = bufferFrom_1.bufferFrom(textBody);
                            return arrayBuffer;
                        }
                        default:
                            return textBody;
                    }
                };
                XMLHttpRequestOverride.prototype.getResponseXML = function () {
                    var contentType = this.getResponseHeader('Content-Type');
                    if (contentType === 'application/xml' || contentType === 'text/xml') {
                        return new xmldom_1.DOMParser().parseFromString(this.responseText, contentType);
                    }
                    return null;
                };
                /**
                 * Propagates mock XMLHttpRequest instance callbacks
                 * to the given XMLHttpRequest instance.
                 */
                XMLHttpRequestOverride.prototype.propagateCallbacks = function (request) {
                    request.onabort = this.abort;
                    request.onerror = this.onerror;
                    request.ontimeout = this.ontimeout;
                    request.onload = this.onload;
                    request.onloadstart = this.onloadstart;
                    request.onloadend = this.onloadend;
                    request.onprogress = this.onprogress;
                    request.onreadystatechange = this.onreadystatechange;
                };
                /**
                 * Propagates the mock XMLHttpRequest instance listeners
                 * to the given XMLHttpRequest instance.
                 */
                XMLHttpRequestOverride.prototype.propagateListeners = function (request) {
                    debug('propagating request listeners (%d) to the original request', this._events.length, this._events);
                    this._events.forEach(function (_a) {
                        var name = _a.name, listener = _a.listener;
                        request.addEventListener(name, listener);
                    });
                };
                XMLHttpRequestOverride.prototype.propagateHeaders = function (request, headers) {
                    debug('propagating request headers to the original request', headers);
                    // Preserve the request headers casing.
                    Object.entries(headers.raw()).forEach(function (_a) {
                        var _b = __read(_a, 2), name = _b[0], value = _b[1];
                        debug('setting "%s" (%s) header on the original request', name, value);
                        request.setRequestHeader(name, value);
                    });
                };
                return XMLHttpRequestOverride;
            }()),
            /* Request state */
            _a.UNSENT = 0,
            _a.OPENED = 1,
            _a.HEADERS_RECEIVED = 2,
            _a.LOADING = 3,
            _a.DONE = 4,
            _a;
    };
    XMLHttpRequestOverride.createXMLHttpRequestOverride = createXMLHttpRequestOverride;

    Object.defineProperty(XMLHttpRequest, "__esModule", { value: true });
    var interceptXMLHttpRequest_1 = XMLHttpRequest.interceptXMLHttpRequest = void 0;
    var XMLHttpRequestOverride_1 = XMLHttpRequestOverride;
    var debug = browser('XHR');
    var pureXMLHttpRequest = 
    // Although executed in node, certain processes emulate the DOM-like environment
    // (i.e. `js-dom` in Jest). The `window` object would be avilable in such environments.
    typeof window === 'undefined' ? undefined : window.XMLHttpRequest;
    /**
     * Intercepts requests issued via `XMLHttpRequest`.
     */
    var interceptXMLHttpRequest = function (observer, resolver) {
        if (pureXMLHttpRequest) {
            debug('patching "XMLHttpRequest" module...');
            var XMLHttpRequestOverride = XMLHttpRequestOverride_1.createXMLHttpRequestOverride({
                pureXMLHttpRequest: pureXMLHttpRequest,
                observer: observer,
                resolver: resolver,
            });
            window.XMLHttpRequest = XMLHttpRequestOverride;
        }
        return function () {
            if (pureXMLHttpRequest) {
                debug('restoring modules...');
                window.XMLHttpRequest = pureXMLHttpRequest;
            }
        };
    };
    interceptXMLHttpRequest_1 = XMLHttpRequest.interceptXMLHttpRequest = interceptXMLHttpRequest;

    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * Converts a given isomorphic request to a `MockedRequest` instance.
     */
    function parseIsomorphicRequest(request) {
        const requestId = uuidv4();
        request.headers.set('x-msw-request-id', requestId);
        const mockedRequest = {
            id: requestId,
            url: request.url,
            method: request.method,
            body: parseBody(request.body, request.headers),
            headers: request.headers,
            cookies: {},
            redirect: 'manual',
            referrer: '',
            keepalive: false,
            cache: 'default',
            mode: 'cors',
            referrerPolicy: 'no-referrer',
            integrity: '',
            destination: 'document',
            bodyUsed: false,
            credentials: 'same-origin',
        };
        // Set mocked request cookies from the `cookie` header of the original request.
        // No need to take `credentials` into account, because in Node.js requests are intercepted
        // _after_ they happen. Request issuer should have already taken care of sending relevant cookies.
        // Unlike browser, where interception is on the worker level, _before_ the request happens.
        const requestCookiesString = request.headers.get('cookie');
        // Attach all the cookies from the virtual cookie store.
        setRequestCookies(mockedRequest);
        const requestCookies = requestCookiesString
            ? parse_1(requestCookiesString)
            : {};
        // Merge both direct request cookies and the cookies inherited
        // from other same-origin requests in the cookie store.
        mockedRequest.cookies = Object.assign(Object.assign({}, mockedRequest.cookies), requestCookies);
        return mockedRequest;
    }

    function createFallbackRequestListener(context, options) {
        const interceptor = lib.createInterceptor({
            modules: [interceptFetch_1, interceptXMLHttpRequest_1],
            resolver(request) {
                return __awaiter$3(this, void 0, void 0, function* () {
                    const mockedRequest = parseIsomorphicRequest(request);
                    return handleRequest(mockedRequest, context.requestHandlers, options, context.emitter, {
                        transformResponse(response) {
                            return {
                                status: response.status,
                                statusText: response.statusText,
                                headers: response.headers.all(),
                                body: response.body,
                            };
                        },
                        onMockedResponseSent(response, { handler, publicRequest, parsedRequest }) {
                            if (!options.quiet) {
                                handler.log(publicRequest, response, handler, parsedRequest);
                            }
                        },
                    });
                });
            },
        });
        interceptor.apply();
        return interceptor;
    }

    function createFallbackStart(context) {
        return function start(options) {
            return __awaiter$3(this, void 0, void 0, function* () {
                context.fallbackInterceptor = createFallbackRequestListener(context, options);
                printStartMessage({
                    message: 'Mocking enabled (fallback mode).',
                    quiet: options.quiet,
                });
                return undefined;
            });
        };
    }

    function createFallbackStop(context) {
        return function stop() {
            var _a, _b;
            (_a = context.fallbackInterceptor) === null || _a === void 0 ? void 0 : _a.restore();
            printStopMessage({ quiet: (_b = context.startOptions) === null || _b === void 0 ? void 0 : _b.quiet });
        };
    }

    /**
     * Pipes all emitted events from one emitter to another.
     */
    function pipeEvents(source, destination) {
        const rawEmit = source.emit;
        // @ts-ignore
        if (rawEmit._isPiped) {
            return;
        }
        source.emit = function (event, ...data) {
            destination.emit(event, ...data);
            return rawEmit.call(this, event, ...data);
        };
        // @ts-ignore
        source.emit._isPiped = true;
    }

    // Declare the list of event handlers on the module's scope
    // so it persists between Fash refreshes of the application's code.
    let listeners = [];
    /**
     * Creates a new mock Service Worker registration
     * with the given request handlers.
     * @param {RequestHandler[]} requestHandlers List of request handlers
     * @see {@link https://mswjs.io/docs/api/setup-worker `setupWorker`}
     */
    function setupWorker(...requestHandlers) {
        requestHandlers.forEach((handler) => {
            if (Array.isArray(handler))
                throw new Error(devUtils.formatMessage('Failed to call "setupWorker" given an Array of request handlers (setupWorker([a, b])), expected to receive each handler individually: setupWorker(a, b).'));
        });
        // Error when attempting to run this function in a Node.js environment.
        if (lib$5.exports.isNodeProcess()) {
            throw new Error(devUtils.formatMessage('Failed to execute `setupWorker` in a non-browser environment. Consider using `setupServer` for Node.js environment instead.'));
        }
        const emitter = new lib$3.StrictEventEmitter();
        const publicEmitter = new lib$3.StrictEventEmitter();
        pipeEvents(emitter, publicEmitter);
        const context = {
            startOptions: undefined,
            worker: null,
            registration: null,
            requestHandlers: [...requestHandlers],
            emitter,
            workerChannel: {
                on(eventType, callback) {
                    context.events.addListener(navigator.serviceWorker, 'message', (event) => {
                        // Avoid messages broadcasted from unrelated workers.
                        if (event.source !== context.worker) {
                            return;
                        }
                        const message = jsonParse(event.data);
                        if (!message) {
                            return;
                        }
                        if (message.type === eventType) {
                            callback(event, message);
                        }
                    });
                },
                send(type) {
                    var _a;
                    (_a = context.worker) === null || _a === void 0 ? void 0 : _a.postMessage(type);
                },
            },
            events: {
                addListener(target, eventType, callback) {
                    target.addEventListener(eventType, callback);
                    listeners.push({ eventType, target, callback });
                    return () => {
                        target.removeEventListener(eventType, callback);
                    };
                },
                removeAllListeners() {
                    for (const { target, eventType, callback } of listeners) {
                        target.removeEventListener(eventType, callback);
                    }
                    listeners = [];
                },
                once(eventType) {
                    const bindings = [];
                    return new Promise((resolve, reject) => {
                        const handleIncomingMessage = (event) => {
                            try {
                                const message = JSON.parse(event.data);
                                if (message.type === eventType) {
                                    resolve(message);
                                }
                            }
                            catch (error) {
                                reject(error);
                            }
                        };
                        bindings.push(context.events.addListener(navigator.serviceWorker, 'message', handleIncomingMessage), context.events.addListener(navigator.serviceWorker, 'messageerror', reject));
                    }).finally(() => {
                        bindings.forEach((unbind) => unbind());
                    });
                },
            },
            useFallbackMode: !('serviceWorker' in navigator) || location.protocol === 'file:',
        };
        const startHandler = context.useFallbackMode
            ? createFallbackStart(context)
            : createStartHandler(context);
        const stopHandler = context.useFallbackMode
            ? createFallbackStop(context)
            : createStop(context);
        return {
            start: prepareStartHandler(startHandler, context),
            stop() {
                context.events.removeAllListeners();
                context.emitter.removeAllListeners();
                publicEmitter.removeAllListeners();
                stopHandler();
            },
            use(...handlers) {
                use(context.requestHandlers, ...handlers);
            },
            restoreHandlers() {
                restoreHandlers(context.requestHandlers);
            },
            resetHandlers(...nextHandlers) {
                context.requestHandlers = resetHandlers(requestHandlers, ...nextHandlers);
            },
            printHandlers() {
                context.requestHandlers.forEach((handler) => {
                    const { header, callFrame } = handler.info;
                    const pragma = handler.info.hasOwnProperty('operationType')
                        ? '[graphql]'
                        : '[rest]';
                    console.groupCollapsed(`${pragma} ${header}`);
                    if (callFrame) {
                        console.log(`Declaration: ${callFrame}`);
                    }
                    console.log('Handler:', handler);
                    if (handler instanceof RestHandler) {
                        console.log('Match:', `https://mswjs.io/repl?path=${handler.info.path}`);
                    }
                    console.groupEnd();
                });
            },
            events: {
                on(...args) {
                    return publicEmitter.on(...args);
                },
                removeListener(...args) {
                    return publicEmitter.removeListener(...args);
                },
                removeAllListeners(...args) {
                    return publicEmitter.removeAllListeners(...args);
                },
            },
        };
    }

    var code$2 = 200;
    var status$2 = "Ok";
    var copyright$2 = "© 2021 MARVEL";
    var attributionText$2 = "Data provided by Marvel. © 2021 MARVEL";
    var attributionHTML$2 = "<a href=\"http://marvel.com\">Data provided by Marvel. © 2021 MARVEL</a>";
    var etag$2 = "b95f7f52ef36d262a544bdbd5616046ad1cec88d";
    var data$2 = {
    	offset: 0,
    	limit: 20,
    	total: 1559,
    	count: 20,
    	results: [
    		{
    			id: 1011334,
    			name: "3-D Man",
    			description: "",
    			modified: "2014-04-29T14:18:17-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/c/e0/535fecbbb9784",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011334",
    			comics: {
    				available: 12,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011334/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21366",
    						name: "Avengers: The Initiative (2007) #14"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24571",
    						name: "Avengers: The Initiative (2007) #14 (SPOTLIGHT VARIANT)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21546",
    						name: "Avengers: The Initiative (2007) #15"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21741",
    						name: "Avengers: The Initiative (2007) #16"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21975",
    						name: "Avengers: The Initiative (2007) #17"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/22299",
    						name: "Avengers: The Initiative (2007) #18"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/22300",
    						name: "Avengers: The Initiative (2007) #18 (ZOMBIE VARIANT)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/22506",
    						name: "Avengers: The Initiative (2007) #19"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8500",
    						name: "Deadpool (1997) #44"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/10223",
    						name: "Marvel Premiere (1972) #35"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/10224",
    						name: "Marvel Premiere (1972) #36"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/10225",
    						name: "Marvel Premiere (1972) #37"
    					}
    				],
    				returned: 12
    			},
    			series: {
    				available: 3,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011334/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1945",
    						name: "Avengers: The Initiative (2007 - 2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2005",
    						name: "Deadpool (1997 - 2002)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2045",
    						name: "Marvel Premiere (1972 - 1981)"
    					}
    				],
    				returned: 3
    			},
    			stories: {
    				available: 21,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011334/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/19947",
    						name: "Cover #19947",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/19948",
    						name: "The 3-D Man!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/19949",
    						name: "Cover #19949",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/19950",
    						name: "The Devil's Music!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/19951",
    						name: "Cover #19951",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/19952",
    						name: "Code-Name:  The Cold Warrior!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47184",
    						name: "AVENGERS: THE INITIATIVE (2007) #14",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47185",
    						name: "Avengers: The Initiative (2007) #14 - Int",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47498",
    						name: "AVENGERS: THE INITIATIVE (2007) #15",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47499",
    						name: "Avengers: The Initiative (2007) #15 - Int",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47792",
    						name: "AVENGERS: THE INITIATIVE (2007) #16",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47793",
    						name: "Avengers: The Initiative (2007) #16 - Int",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/48361",
    						name: "AVENGERS: THE INITIATIVE (2007) #17",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/48362",
    						name: "Avengers: The Initiative (2007) #17 - Int",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/49103",
    						name: "AVENGERS: THE INITIATIVE (2007) #18",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/49104",
    						name: "Avengers: The Initiative (2007) #18 - Int",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/49106",
    						name: "Avengers: The Initiative (2007) #18, Zombie Variant - Int",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/49888",
    						name: "AVENGERS: THE INITIATIVE (2007) #19",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/49889",
    						name: "Avengers: The Initiative (2007) #19 - Int",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/54371",
    						name: "Avengers: The Initiative (2007) #14, Spotlight Variant - Int",
    						type: "interiorStory"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011334/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/269",
    						name: "Secret Invasion"
    					}
    				],
    				returned: 1
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/74/3-d_man?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/3-D_Man_(Chandler)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011334/3-d_man?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1017100,
    			name: "A-Bomb (HAS)",
    			description: "Rick Jones has been Hulk's best bud since day one, but now he's more than a friend...he's a teammate! Transformed by a Gamma energy explosion, A-Bomb's thick, armored skin is just as strong and powerful as it is blue. And when he curls into action, he uses it like a giant bowling ball of destruction! ",
    			modified: "2013-09-18T15:54:04-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/3/20/5232158de5b16",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1017100",
    			comics: {
    				available: 4,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1017100/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/47176",
    						name: "FREE COMIC BOOK DAY 2013 1 (2013) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/40632",
    						name: "Hulk (2008) #53"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/40630",
    						name: "Hulk (2008) #54"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/40628",
    						name: "Hulk (2008) #55"
    					}
    				],
    				returned: 4
    			},
    			series: {
    				available: 2,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1017100/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/17765",
    						name: "FREE COMIC BOOK DAY 2013 1 (2013)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3374",
    						name: "Hulk (2008 - 2012)"
    					}
    				],
    				returned: 2
    			},
    			stories: {
    				available: 7,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1017100/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/92078",
    						name: "Hulk (2008) #55",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/92079",
    						name: "Interior #92079",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/92082",
    						name: "Hulk (2008) #54",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/92083",
    						name: "Interior #92083",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/92086",
    						name: "Hulk (2008) #53",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/92087",
    						name: "Interior #92087",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/105929",
    						name: "cover from Free Comic Book Day 2013 (Avengers/Hulk) (2013) #1",
    						type: "cover"
    					}
    				],
    				returned: 7
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1017100/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/76/a-bomb?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1017100/a-bomb_has?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1009144,
    			name: "A.I.M.",
    			description: "AIM is a terrorist organization bent on destroying the world.",
    			modified: "2013-10-17T14:41:30-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/6/20/52602f21f29ec",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1009144",
    			comics: {
    				available: 49,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009144/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/36763",
    						name: "Ant-Man & the Wasp (2010) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17553",
    						name: "Avengers (1998) #67"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/7340",
    						name: "Avengers (1963) #87"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/4214",
    						name: "Avengers and Power Pack Assemble! (2006) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/63217",
    						name: "Avengers and Power Pack (2017) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/63218",
    						name: "Avengers and Power Pack (2017) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/63219",
    						name: "Avengers and Power Pack (2017) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/63220",
    						name: "Avengers and Power Pack (2017) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/64790",
    						name: "Avengers by Brian Michael Bendis: The Complete Collection Vol. 2 (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/1170",
    						name: "Avengers Vol. 2: Red Zone (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/1214",
    						name: "Avengers Vol. II: Red Zone (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12787",
    						name: "Captain America (1998) #28"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/7513",
    						name: "Captain America (1968) #132"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/7514",
    						name: "Captain America (1968) #133"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/65466",
    						name: "Captain America by Mark Waid, Ron Garney & Andy Kubert (Hardcover)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20367",
    						name: "Defenders (1972) #57"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/31068",
    						name: "Incredible Hulks (2010) #606 (VARIANT)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/46168",
    						name: "Indestructible Hulk (2012) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/43944",
    						name: "Iron Man (2012) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/9544",
    						name: "Iron Man (1968) #295"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 33,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009144/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13082",
    						name: "Ant-Man & the Wasp (2010 - 2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/354",
    						name: "Avengers (1998 - 2004)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1991",
    						name: "Avengers (1963 - 1996)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23123",
    						name: "Avengers and Power Pack (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1046",
    						name: "Avengers and Power Pack Assemble! (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23600",
    						name: "Avengers by Brian Michael Bendis: The Complete Collection Vol. 2 (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/227",
    						name: "Avengers Vol. 2: Red Zone (2003)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/271",
    						name: "Avengers Vol. II: Red Zone (2003)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1997",
    						name: "Captain America (1998 - 2002)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1996",
    						name: "Captain America (1968 - 1996)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23810",
    						name: "Captain America by Mark Waid, Ron Garney & Andy Kubert (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3743",
    						name: "Defenders (1972 - 1986)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/8842",
    						name: "Incredible Hulks (2010 - 2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/16583",
    						name: "Indestructible Hulk (2012 - 2014)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/16593",
    						name: "Iron Man (2012 - 2014)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2029",
    						name: "Iron Man (1968 - 1996)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23915",
    						name: "Iron Man Epic Collection: Doom (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/9718",
    						name: "Marvel Adventures Super Heroes (2010 - 2012)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/189",
    						name: "Marvel Masterworks: Captain America Vol. 1 - 2nd Edition (2003)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1506",
    						name: "MARVEL MASTERWORKS: CAPTAIN AMERICA VOL. 1 HC (2005)"
    					}
    				],
    				returned: 20
    			},
    			stories: {
    				available: 52,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009144/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5800",
    						name: "Avengers and Power Pack Assemble! (2006) #2",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5801",
    						name: "2 of 4 - 4XLS",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/10253",
    						name: "When the Unliving Strike",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/10255",
    						name: "Cover #10255",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/10256",
    						name: "The Enemy Within!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/10259",
    						name: "Death Before Dishonor!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/10261",
    						name: "Cover #10261",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/10262",
    						name: "The End of A.I.M.!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/11921",
    						name: "The Red Skull Lives!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/11930",
    						name: "He Who Holds the Cosmic Cube",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/11936",
    						name: "The Maddening Mystery of the Inconceivable Adaptoid!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/11981",
    						name: "If This Be... Modok",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/11984",
    						name: "A Time to Die -- A Time to Live!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/11995",
    						name: "At the Mercy of the Maggia",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/15243",
    						name: "Look Homeward, Avenger",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/17518",
    						name: "Captain America (1968) #132",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/17519",
    						name: "The Fearful Secret of Bucky Barnes",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/17520",
    						name: "Captain America (1968) #133",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/17521",
    						name: "Madness In the Slums",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28233",
    						name: "In Sin Airy X",
    						type: "interiorStory"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009144/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/comics/characters/1009144/aim.?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/A.I.M.?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1009144/aim.?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1010699,
    			name: "Aaron Stack",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1010699",
    			comics: {
    				available: 14,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010699/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/40776",
    						name: "Dark Avengers (2012) #177"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/40773",
    						name: "Dark Avengers (2012) #179"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/40774",
    						name: "Dark Avengers (2012) #180"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/40778",
    						name: "Dark Avengers (2012) #181"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/40787",
    						name: "Dark Avengers (2012) #182"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/40786",
    						name: "Dark Avengers (2012) #183"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/38073",
    						name: "Hulk (2008) #43"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/11910",
    						name: "Universe X (2000) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/11911",
    						name: "Universe X (2000) #7"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/11912",
    						name: "Universe X (2000) #8"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/11913",
    						name: "Universe X (2000) #9"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/11903",
    						name: "Universe X (2000) #10"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/11904",
    						name: "Universe X (2000) #11"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/11905",
    						name: "Universe X (2000) #12"
    					}
    				],
    				returned: 14
    			},
    			series: {
    				available: 3,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010699/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/789",
    						name: "Dark Avengers (2012 - 2013)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3374",
    						name: "Hulk (2008 - 2012)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2085",
    						name: "Universe X (2000 - 2001)"
    					}
    				],
    				returned: 3
    			},
    			stories: {
    				available: 27,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010699/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/25634",
    						name: "Universe X (2000) #10",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/25635",
    						name: "Interior #25635",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/25637",
    						name: "Universe X (2000) #12",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/25638",
    						name: "Interior #25638",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/25647",
    						name: "Universe X (2000) #6",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/25648",
    						name: "Interior #25648",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/25649",
    						name: "Universe X (2000) #7",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/25650",
    						name: "Interior #25650",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/25651",
    						name: "Universe X (2000) #8",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/25652",
    						name: "Interior #25652",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/25653",
    						name: "Universe X (2000) #9",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/25654",
    						name: "Interior #25654",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/67100",
    						name: "Universe X (2000) #11",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/89190",
    						name: "Hulk (2008) #43",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/90002",
    						name: "Interior #90002",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/92370",
    						name: "Dark Avengers (2012) #179",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/92371",
    						name: "Interior #92371",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/92372",
    						name: "Dark Avengers (2012) #180",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/92373",
    						name: "Interior #92373",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/92376",
    						name: "Dark Avengers (2012) #177",
    						type: "cover"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010699/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/2809/aaron_stack?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1010699/aaron_stack?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1009146,
    			name: "Abomination (Emil Blonsky)",
    			description: "Formerly known as Emil Blonsky, a spy of Soviet Yugoslavian origin working for the KGB, the Abomination gained his powers after receiving a dose of gamma radiation similar to that which transformed Bruce Banner into the incredible Hulk.",
    			modified: "2012-03-20T12:32:12-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/9/50/4ce18691cbf04",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1009146",
    			comics: {
    				available: 53,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009146/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17547",
    						name: "Avengers (1998) #61"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17548",
    						name: "Avengers (1998) #62"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/1098",
    						name: "Avengers Vol. 1: World Trust (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8557",
    						name: "Earth X (1999) #7"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/4241",
    						name: "EARTH X TPB [NEW PRINTING] (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20863",
    						name: "Hulk (2008) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/2499",
    						name: "Hulk: Destruction (2005) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14424",
    						name: "Hulk (1999) #24"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14425",
    						name: "Hulk (1999) #25"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14428",
    						name: "Hulk (1999) #28"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14450",
    						name: "Hulk (1999) #50"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14451",
    						name: "Hulk (1999) #51"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14453",
    						name: "Hulk (1999) #53"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14454",
    						name: "Hulk (1999) #54"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8948",
    						name: "Incredible Hulk (1962) #137"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8982",
    						name: "Incredible Hulk (1962) #171"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/9005",
    						name: "Incredible Hulk (1962) #194"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/9006",
    						name: "Incredible Hulk (1962) #195"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/9007",
    						name: "Incredible Hulk (1962) #196"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/9011",
    						name: "Incredible Hulk (1962) #200"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 26,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009146/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/354",
    						name: "Avengers (1998 - 2004)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/158",
    						name: "Avengers Vol. 1: World Trust (2003)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/378",
    						name: "Earth X (1999 - 2000)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1806",
    						name: "EARTH X TPB [NEW PRINTING] (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3374",
    						name: "Hulk (2008 - 2012)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/465",
    						name: "Hulk (1999 - 2008)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/924",
    						name: "Hulk: Destruction (2005)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2021",
    						name: "Incredible Hulk (1962 - 1999)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2983",
    						name: "Incredible Hulk Annual (1976 - 1994)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22424",
    						name: "Incredible Hulk Epic Collection: The Hulk Must Die (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/212",
    						name: "Incredible Hulk Vol. 4: Abominable (2003)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/244",
    						name: "Incredible Hulk Vol. IV: Abominable (2003)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/8842",
    						name: "Incredible Hulks (2010 - 2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2572",
    						name: "Iron Man (1998 - 2004)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/977",
    						name: "Irredeemable Ant-Man (2006 - 2007)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2423",
    						name: "Irredeemable Ant-Man Vol. 1: Low-Life (2007)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3722",
    						name: "Killraven (2002 - 2003)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2437",
    						name: "KILLRAVEN PREMIERE HC (2007)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/21675",
    						name: "Marvel Cinematic Universe Guidebook: The Avengers Initiative (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22327",
    						name: "Marvel Masterworks: The Incredible Hulk Vol. 11 (2017)"
    					}
    				],
    				returned: 20
    			},
    			stories: {
    				available: 63,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009146/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/4946",
    						name: "4 of 4 - 4XLS",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5496",
    						name: "Irredeemable Ant-Man (2006) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12370",
    						name: "Cover #12370",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12372",
    						name: "Whosoever Harms the Hulk..!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18419",
    						name: "[none]",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18420",
    						name: "The Stars Mine Enemy",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18488",
    						name: "Incredible Hulk (1962) #171",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18489",
    						name: "Revenge",
    						type: ""
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18534",
    						name: "Incredible Hulk (1962) #194",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18535",
    						name: "The Day of the Locust!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18536",
    						name: "Incredible Hulk (1962) #195",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18537",
    						name: "Warfare In Wonderland!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18538",
    						name: "Incredible Hulk (1962) #196",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18539",
    						name: "The Abomination Proclamation!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18546",
    						name: "Incredible Hulk (1962) #200",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18547",
    						name: "An Intruder In the Mind!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18776",
    						name: "Cover #18776",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18877",
    						name: "Incredible Hulk (1962) #364",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18878",
    						name: "Countdown Part 4: The Abomination",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18881",
    						name: "Incredible Hulk (1962) #366",
    						type: "cover"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009146/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/296",
    						name: "Chaos War"
    					}
    				],
    				returned: 1
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/81/abomination?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Abomination?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1009146/abomination_emil_blonsky?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1016823,
    			name: "Abomination (Ultimate)",
    			description: "",
    			modified: "2012-07-10T19:11:52-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1016823",
    			comics: {
    				available: 2,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1016823/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/40638",
    						name: "Hulk (2008) #50"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15717",
    						name: "Ultimate X-Men (2001) #26"
    					}
    				],
    				returned: 2
    			},
    			series: {
    				available: 2,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1016823/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3374",
    						name: "Hulk (2008 - 2012)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/474",
    						name: "Ultimate X-Men (2001 - 2009)"
    					}
    				],
    				returned: 2
    			},
    			stories: {
    				available: 3,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1016823/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/31883",
    						name: "Free Preview of THE INCREDIBLE HULK #50",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/92098",
    						name: "Hulk (2008) #50",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/92099",
    						name: "Interior #92099",
    						type: "interiorStory"
    					}
    				],
    				returned: 3
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1016823/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/81/abomination?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1016823/abomination_ultimate?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1009148,
    			name: "Absorbing Man",
    			description: "",
    			modified: "2013-10-24T14:32:08-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/1/b0/5269678709fb7",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1009148",
    			comics: {
    				available: 94,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009148/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/43507",
    						name: "A+X (2012) #8"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/7045",
    						name: "Avengers (1963) #183"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/7046",
    						name: "Avengers (1963) #184"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/7142",
    						name: "Avengers (1963) #270"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/36481",
    						name: "Avengers Academy (2010) #16"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/36480",
    						name: "Avengers Academy (2010) #17"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/36479",
    						name: "Avengers Academy (2010) #18"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/36484",
    						name: "Avengers Academy (2010) #19"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17776",
    						name: "Avengers Annual (1967) #20"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/63662",
    						name: "Black Bolt (2017) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/64278",
    						name: "Black Bolt (2017) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/66533",
    						name: "Black Bolt (2017) #11"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/65327",
    						name: "Black Bolt Vol. 1: Hard Time (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12783",
    						name: "Captain America (1998) #24"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20427",
    						name: "Dazzler (1981) #18"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20428",
    						name: "Dazzler (1981) #19"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8499",
    						name: "Deadpool (1997) #43"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15541",
    						name: "Fantastic Four (1998) #22"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13151",
    						name: "Fantastic Four (1961) #330"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/41433",
    						name: "Fear Itself (2010) #2 (3rd Printing Variant)"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 48,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009148/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/16450",
    						name: "A+X (2012 - 2014)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1991",
    						name: "Avengers (1963 - 1996)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/9086",
    						name: "Avengers Academy (2010 - 2012)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1988",
    						name: "Avengers Annual (1967 - 1994)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23121",
    						name: "Black Bolt (2017 - 2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23778",
    						name: "Black Bolt Vol. 1: Hard Time (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1997",
    						name: "Captain America (1998 - 2002)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3745",
    						name: "Dazzler (1981 - 1986)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2005",
    						name: "Deadpool (1997 - 2002)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2121",
    						name: "Fantastic Four (1961 - 1998)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/421",
    						name: "Fantastic Four (1998 - 2012)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13691",
    						name: "Fear Itself (2010 - 2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13857",
    						name: "Fear Itself: Fellowship of Fear (2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13827",
    						name: "Fear Itself: The Worthy (2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/31372",
    						name: "Gamma Flight (2021 - Present)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/20084",
    						name: "Heroes for Hire (1997 - 1999)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/465",
    						name: "Hulk (1999 - 2008)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/20552",
    						name: "Illuminati (2015 - 2016)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24278",
    						name: "Immortal Hulk (2018 - Present)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24891",
    						name: "Immortal Hulk Vol. 2: The Green Door (2019)"
    					}
    				],
    				returned: 20
    			},
    			stories: {
    				available: 107,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009148/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/4988",
    						name: "1 of 1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/7866",
    						name: "Punisher War Journal (2006) #4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/10997",
    						name: "Journey Into Mystery (1952) #114",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/10998",
    						name: "The Stronger I Am, the Sooner I Die",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/11000",
    						name: "Journey Into Mystery (1952) #115",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/11001",
    						name: "The Vengeance of the Thunder God",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/11022",
    						name: "Journey Into Mystery (1952) #120",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/11023",
    						name: "With My Hammer In Hand",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/11025",
    						name: "Journey Into Mystery (1952) #121",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/11026",
    						name: "The Power!  The Passion!  The Pride!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/11028",
    						name: "Journey Into Mystery (1952) #122",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/11029",
    						name: "Where Mortals Fear To Tread!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/11031",
    						name: "Journey Into Mystery (1952) #123",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/11032",
    						name: "While a Universe Trembles",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12951",
    						name: "Fantastic Four (1961) #330",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12952",
    						name: "Good Dreams!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/14628",
    						name: "Avengers (1963) #183",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/14630",
    						name: "Avengers (1963) #184",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/14823",
    						name: "Avengers (1963) #270",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/16688",
    						name: "Thor (1966) #206",
    						type: "cover"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 4,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009148/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/238",
    						name: "Civil War"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/302",
    						name: "Fear Itself"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/270",
    						name: "Secret Wars"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/273",
    						name: "Siege"
    					}
    				],
    				returned: 4
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/comics/characters/1009148/absorbing_man?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Absorbing_Man?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1009148/absorbing_man?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1009149,
    			name: "Abyss",
    			description: "",
    			modified: "2014-04-29T14:10:43-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/9/30/535feab462a64",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1009149",
    			comics: {
    				available: 8,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009149/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13943",
    						name: "Uncanny X-Men (1963) #402"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13945",
    						name: "Uncanny X-Men (1963) #404"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13946",
    						name: "Uncanny X-Men (1963) #405"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13947",
    						name: "Uncanny X-Men (1963) #406"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13970",
    						name: "Uncanny X-Men (1963) #429"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13972",
    						name: "Uncanny X-Men (1963) #431"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12386",
    						name: "X-Men: Alpha (1995) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/2539",
    						name: "X-Men: The Complete Age of Apocalypse Epic Book 2 (Trade Paperback)"
    					}
    				],
    				returned: 8
    			},
    			series: {
    				available: 3,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009149/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2258",
    						name: "Uncanny X-Men (1963 - 2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2104",
    						name: "X-Men: Alpha (1995)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1583",
    						name: "X-Men: The Complete Age of Apocalypse Epic Book 2 (2005)"
    					}
    				],
    				returned: 3
    			},
    			stories: {
    				available: 8,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009149/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/26281",
    						name: "A Beginning",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28352",
    						name: "Utility of Myth",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28356",
    						name: "Army Ants",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28358",
    						name: "Ballroom Blitzkrieg",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28360",
    						name: "Staring Contests are for Suckers",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28407",
    						name: "The Draco Part One: Sins of the Father",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28411",
    						name: "The Draco Part Three",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28413",
    						name: "The Draco Part Four",
    						type: "interiorStory"
    					}
    				],
    				returned: 8
    			},
    			events: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009149/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/227",
    						name: "Age of Apocalypse"
    					}
    				],
    				returned: 1
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/85/abyss?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Abyss_(alien)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1009149/abyss?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1010903,
    			name: "Abyss (Age of Apocalypse)",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/3/80/4c00358ec7548",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1010903",
    			comics: {
    				available: 3,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010903/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/18099",
    						name: "Weapon X (1995) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12386",
    						name: "X-Men: Alpha (1995) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/2539",
    						name: "X-Men: The Complete Age of Apocalypse Epic Book 2 (Trade Paperback)"
    					}
    				],
    				returned: 3
    			},
    			series: {
    				available: 3,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010903/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3635",
    						name: "Weapon X (1995)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2104",
    						name: "X-Men: Alpha (1995)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1583",
    						name: "X-Men: The Complete Age of Apocalypse Epic Book 2 (2005)"
    					}
    				],
    				returned: 3
    			},
    			stories: {
    				available: 2,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010903/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/26280",
    						name: "X-Men: Alpha (1994) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/38448",
    						name: "X-Facts",
    						type: ""
    					}
    				],
    				returned: 2
    			},
    			events: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010903/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/227",
    						name: "Age of Apocalypse"
    					}
    				],
    				returned: 1
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/85/abyss?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Abyss_(Age_of_Apocalypse)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1010903/abyss_age_of_apocalypse?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011266,
    			name: "Adam Destine",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011266",
    			comics: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011266/comics",
    				items: [
    				],
    				returned: 0
    			},
    			series: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011266/series",
    				items: [
    				],
    				returned: 0
    			},
    			stories: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011266/stories",
    				items: [
    				],
    				returned: 0
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011266/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/2902/adam_destine?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Destine,_Adam?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011266/adam_destine?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1010354,
    			name: "Adam Warlock",
    			description: "Adam Warlock is an artificially created human who was born in a cocoon at a scientific complex called The Beehive.",
    			modified: "2013-08-07T13:49:06-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/a/f0/5202887448860",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1010354",
    			comics: {
    				available: 188,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010354/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/62151",
    						name: "All-New Guardians of the Galaxy Vol. 3: Infinity Quest (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17271",
    						name: "Annihilation: Conquest (2007) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17405",
    						name: "Annihilation: Conquest (2007) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17645",
    						name: "Annihilation: Conquest (2007) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20686",
    						name: "Annihilation: Conquest (2007) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20885",
    						name: "Annihilation: Conquest (2007) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21016",
    						name: "Annihilation: Conquest (2007) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12412",
    						name: "Avengers Forever (1998) #9"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/1033",
    						name: "Avengers Legends Vol. I: Avengers Forever (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20731",
    						name: "CLANDESTINE CLASSIC PREMIERE HC (Hardcover)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20187",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #27"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20193",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #32"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20197",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #36"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8552",
    						name: "Earth X (1999) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8550",
    						name: "Earth X (1999) #11"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/4241",
    						name: "EARTH X TPB [NEW PRINTING] (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12975",
    						name: "Fantastic Four (1961) #172"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13195",
    						name: "Fantastic Four (1961) #370"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/25305",
    						name: "Guardians of the Galaxy (2008) #17"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/65547",
    						name: "All-New Guardians of the Galaxy (2017) #150"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 82,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010354/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23058",
    						name: "All-New Guardians of the Galaxy (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22778",
    						name: "All-New Guardians of the Galaxy Vol. 3: Infinity Quest (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3061",
    						name: "Annihilation: Conquest (2007)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2111",
    						name: "Avengers Forever (1998 - 1999)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/93",
    						name: "Avengers Legends Vol. I: Avengers Forever (2002)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3874",
    						name: "CLANDESTINE CLASSIC PREMIERE HC (2008)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3741",
    						name: "Doctor Strange, Sorcerer Supreme (1988 - 1996)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/378",
    						name: "Earth X (1999 - 2000)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1806",
    						name: "EARTH X TPB [NEW PRINTING] (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2121",
    						name: "Fantastic Four (1961 - 1998)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/4885",
    						name: "Guardians of the Galaxy (2008 - 2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/27554",
    						name: "Guardians Of The Galaxy Annual (2019)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/26496",
    						name: "Guardians Of The Galaxy Vol. 2: Faithless (2020)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22422",
    						name: "GUARDIANS OF THE GALAXY: ROAD TO ANNIHILATION VOL. 2 TPB (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2021",
    						name: "Incredible Hulk (1962 - 1999)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2983",
    						name: "Incredible Hulk Annual (1976 - 1994)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/26307",
    						name: "Infinity By Starlin & Hickman (2019)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24050",
    						name: "Infinity Countdown (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24300",
    						name: "Infinity Countdown Prime (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23991",
    						name: "Infinity Countdown: Adam Warlock (2018)"
    					}
    				],
    				returned: 20
    			},
    			stories: {
    				available: 217,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010354/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1412",
    						name: "Cover #1412",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1602",
    						name: "Cover #1602",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1800",
    						name: "Cover #1800",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1842",
    						name: "Cover #1842",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/3758",
    						name: "WARLOCK (2004) #3",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/3760",
    						name: "WARLOCK (2004) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/3762",
    						name: "WARLOCK (2004) #2",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/3764",
    						name: "WARLOCK (2004) #4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12568",
    						name: "Fantastic Four (1961) #172",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12569",
    						name: "Cry, the Bedeviled Planet!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13121",
    						name: "Forever Evil",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18500",
    						name: "Incredible Hulk (1962) #177",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18501",
    						name: "Peril of the Paired Planets",
    						type: ""
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/18503",
    						name: "Triumph On Terra-Two",
    						type: ""
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/19847",
    						name: "Cover #19847",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/19848",
    						name: "Performance",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/19859",
    						name: "Days of Future Present Part 4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/19860",
    						name: "You Must Remember This",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/19883",
    						name: "The Adventures of Lockheed the Space Dragon and His Pet Girl, Kitty",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/19884",
    						name: "The Saga of Storm: Goddess of Thunder",
    						type: "cover"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 8,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010354/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/293",
    						name: "Annihilation: Conquest"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/233",
    						name: "Atlantis Attacks"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/235",
    						name: "Blood and Thunder"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/240",
    						name: "Days of Future Present"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/29",
    						name: "Infinity War"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/263",
    						name: "Mutant Massacre"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/271",
    						name: "Secret Wars II"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/280",
    						name: "X-Tinction Agenda"
    					}
    				],
    				returned: 8
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/comics/characters/1010354/adam_warlock?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Warlock,_Adam?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1010354/adam_warlock?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1010846,
    			name: "Aegis (Trey Rollins)",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/5/e0/4c0035c9c425d",
    				extension: "gif"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1010846",
    			comics: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010846/comics",
    				items: [
    				],
    				returned: 0
    			},
    			series: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010846/series",
    				items: [
    				],
    				returned: 0
    			},
    			stories: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010846/stories",
    				items: [
    				],
    				returned: 0
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010846/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/95/aegis?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Aegis_%28Trey_Rollins%29?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1010846/aegis_trey_rollins?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1017851,
    			name: "Aero (Aero)",
    			description: "",
    			modified: "2021-08-27T17:52:34-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1017851",
    			comics: {
    				available: 23,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1017851/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/76349",
    						name: "Aero (2019) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/76350",
    						name: "Aero (2019) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/76351",
    						name: "Aero (2019) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/76352",
    						name: "Aero (2019) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/76353",
    						name: "Aero (2019) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/76354",
    						name: "Aero (2019) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/76355",
    						name: "Aero (2019) #7"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/76356",
    						name: "Aero (2019) #8"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/76357",
    						name: "Aero (2019) #9"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/76358",
    						name: "Aero (2019) #10"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/76359",
    						name: "Aero (2019) #11"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/76360",
    						name: "Aero (2019) #12"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/77001",
    						name: "Agents of Atlas (2019) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/77003",
    						name: "Agents of Atlas (2019) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/77005",
    						name: "Agents of Atlas (2019) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/83989",
    						name: "Atlantis Attacks (2020) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/83993",
    						name: "Atlantis Attacks (2020) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/83994",
    						name: "Atlantis Attacks (2020) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/83995",
    						name: "Atlantis Attacks (2020) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/83996",
    						name: "Atlantis Attacks (2020) #5"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 5,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1017851/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/27392",
    						name: "Aero (2019 - 2020)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/27624",
    						name: "Agents of Atlas (2019)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/29600",
    						name: "Atlantis Attacks (2020)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/31376",
    						name: "King In Black: Black Knight (2021)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/28381",
    						name: "The Marvels (2021 - Present)"
    					}
    				],
    				returned: 5
    			},
    			stories: {
    				available: 23,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1017851/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/169570",
    						name: "cover from Aero (2019) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/169572",
    						name: "cover from Aero (2019) #2",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/169574",
    						name: "cover from Aero (2019) #3",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/169576",
    						name: "cover from Aero (2019) #4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/169578",
    						name: "cover from Aero (2019) #5",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/169580",
    						name: "cover from Aero (2019) #6",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/169582",
    						name: "cover from Aero (2019) #7",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/169584",
    						name: "cover from Aero (2019) #8",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/169586",
    						name: "cover from Aero (2019) #9",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/169588",
    						name: "cover from Aero (2019) #10",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/169590",
    						name: "cover from Aero (2019) #11",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/169592",
    						name: "cover from Aero (2019) #12",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/170874",
    						name: "cover from New Agents of Atlas (2019) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/170878",
    						name: "cover from New Agents of Atlas (2019) #3",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/170882",
    						name: "cover from New Agents of Atlas (2019) #5",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/178282",
    						name: "cover from The Marvels (2029) #2",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/178288",
    						name: "cover from The Marvels (2029) #4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/185766",
    						name: "cover from Agents of Atlas: Atlantis Attacks (2020) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/185774",
    						name: "cover from Agents of Atlas: Atlantis Attacks (2020) #2",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/185776",
    						name: "cover from Agents of Atlas: Atlantis Attacks (2020) #3",
    						type: "cover"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1017851/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/comics/characters/1017851/aero_aero?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1017851/aero_aero?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1012717,
    			name: "Agatha Harkness",
    			description: "",
    			modified: "2021-08-06T11:30:56-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/c/a0/4ce5a9bf70e19",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1012717",
    			comics: {
    				available: 19,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1012717/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17751",
    						name: "Avengers (1996) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17756",
    						name: "Avengers (1996) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17757",
    						name: "Avengers (1996) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17758",
    						name: "Avengers (1996) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17762",
    						name: "Avengers (1996) #8"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21358",
    						name: "Avengers Fairy Tales (2008) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/77235",
    						name: "Captain America (2018) #19"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13304",
    						name: "Fantastic Four (1961) #94"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/4203",
    						name: "Marvel Masterworks: The Fantastic Four Vol.10 (Hardcover)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/54974",
    						name: "Scarlet Witch (1994) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/57094",
    						name: "Scarlet Witch (2015) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/54977",
    						name: "Scarlet Witch (1994) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/54978",
    						name: "Scarlet Witch (1994) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/60028",
    						name: "Scarlet Witch (2015) #13"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21182",
    						name: "Ultimate Fantastic Four (2003) #54"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21332",
    						name: "Ultimate Fantastic Four (2003) #55"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21510",
    						name: "Ultimate Fantastic Four (2003) #56"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/18460",
    						name: "Vision and the Scarlet Witch (1985) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/18458",
    						name: "Vision and the Scarlet Witch (1985) #12"
    					}
    				],
    				returned: 19
    			},
    			series: {
    				available: 9,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1012717/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3621",
    						name: "Avengers (1996 - 1997)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3971",
    						name: "Avengers Fairy Tales (2008)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24503",
    						name: "Captain America (2018 - Present)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2121",
    						name: "Fantastic Four (1961 - 1998)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1693",
    						name: "Marvel Masterworks: The Fantastic Four Vol.10 (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/20854",
    						name: "Scarlet Witch (2015 - 2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/20338",
    						name: "Scarlet Witch (1994)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/702",
    						name: "Ultimate Fantastic Four (2003 - 2009)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3655",
    						name: "Vision and the Scarlet Witch (1985 - 1986)"
    					}
    				],
    				returned: 9
    			},
    			stories: {
    				available: 23,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1012717/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13503",
    						name: "The Return of the Frightful Four",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37673",
    						name: "Avengers (1996) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37688",
    						name: "Avengers (1996) #2",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37690",
    						name: "Avengers (1996) #3",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37693",
    						name: "Avengers (1996) #4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37701",
    						name: "Avengers (1996) #8",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/39320",
    						name: "VISION AND THE SCARLET WITCH (1985) #12",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/39325",
    						name: "Ancestors",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/46790",
    						name: "Ultimate Fantastic Four (2003) #54",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/46791",
    						name: "Namor War 1 of 4",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47112",
    						name: "Ultimate Fantastic Four (2003) #55",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47113",
    						name: "Namor War 2 of 4",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47169",
    						name: "Avengers Fairy Tales (2008) #4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47170",
    						name: "The Wizard of Oz",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47425",
    						name: "Ultimate Fantastic Four (2003) #56",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47426",
    						name: "3 of 4 - Salem Seven",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/125005",
    						name: "cover from Scarlet Witch (2016) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/130587",
    						name: "cover from Scarlet Witch (2015) #13",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/135317",
    						name: "interior to Scarlet Witch (1994) #1",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/135321",
    						name: "interior to Scarlet Witch (1994) #3",
    						type: "interiorStory"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1012717/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/comics/characters/1012717/agatha_harkness?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Agatha%20Harkness?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1012717/agatha_harkness?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011297,
    			name: "Agent Brand",
    			description: "",
    			modified: "2013-10-24T13:09:30-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/4/60/52695285d6e7e",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011297",
    			comics: {
    				available: 23,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011297/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/6120",
    						name: "Astonishing X-Men (2004) #21"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/6309",
    						name: "Astonishing X-Men (2004) #22"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/16119",
    						name: "Astonishing X-Men (2004) #23"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17353",
    						name: "Astonishing X-Men (2004) #24"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24503",
    						name: "Astonishing X-Men (2004) #32"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24504",
    						name: "Astonishing X-Men (2004) #33"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/38318",
    						name: "Astonishing X-Men (2004) #38"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/38319",
    						name: "Astonishing X-Men (2004) #40"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/40024",
    						name: "Astonishing X-Men (2004) #40 (I Am Captain America Variant)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/45950",
    						name: "Cable and X-Force (2012) #8"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/39890",
    						name: "Heralds (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/90340",
    						name: "S.W.O.R.D. (2020) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/26232",
    						name: "S.W.O.R.D. (2009) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/90341",
    						name: "S.W.O.R.D. (2020) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/26233",
    						name: "S.W.O.R.D. (2009) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/90342",
    						name: "S.W.O.R.D. (2020) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/26234",
    						name: "S.W.O.R.D. (2009) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/90343",
    						name: "S.W.O.R.D. (2020) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/90344",
    						name: "S.W.O.R.D. (2020) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/30518",
    						name: "S.W.O.R.D. (2009) #5"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 6,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011297/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/744",
    						name: "Astonishing X-Men (2004 - 2013)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/16907",
    						name: "Cable and X-Force (2012 - 2014)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13065",
    						name: "Heralds (2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/31083",
    						name: "S.W.O.R.D. (2020 - Present)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/8233",
    						name: "S.W.O.R.D. (2009 - 2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22551",
    						name: "The Mighty Captain Marvel (2017 - 2018)"
    					}
    				],
    				returned: 6
    			},
    			stories: {
    				available: 27,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011297/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/3353",
    						name: "Interior #3353",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/7670",
    						name: "ASTONISHING X-MEN (2004) #21",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/8144",
    						name: "ASTONISHING X-MEN (2004) #22",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/32919",
    						name: "ASTONISHING X-MEN (2004) #23",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/36374",
    						name: "ASTONISHING X-MEN (2004) #24",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/54039",
    						name: "ASTONISHING X-MEN (2004) #32",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/54041",
    						name: "ASTONISHING X-MEN (2004) #33",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/57763",
    						name: "S.W.O.R.D. (2009) #2",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/57765",
    						name: "S.W.O.R.D. (2009) #3",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/57767",
    						name: "S.W.O.R.D. (2009) #4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/69862",
    						name: "S.W.O.R.D. (2009) #5",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/89830",
    						name: "ASTONISHING X-MEN (2004) #38",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/89900",
    						name: "Astonishing X-Men (2004) #38",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/90548",
    						name: "Heralds TPB",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/90819",
    						name: "Interior #90819",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/90853",
    						name: " Interior  Astonishing X-Men (2004) #40",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/90944",
    						name: "ASTONISHING X-MEN (2004) #40",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/103418",
    						name: "Cable and X-Force (2012) #8",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/103419",
    						name: "story from Cable and X-Force (2012) #8",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/133289",
    						name: "cover from Captain Marvel (2016) #5",
    						type: "cover"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011297/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/100/agent_brand?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Agent_Brand?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011297/agent_brand?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011031,
    			name: "Agent X (Nijo)",
    			description: "Originally a partner of the mind-altering assassin Black Swan, Nijo spied on Deadpool as part of the Swan's plan to exact revenge for Deadpool falsely taking credit for the Swan's assassination of the Four Winds crime family, which included Nijo's brother.",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011031",
    			comics: {
    				available: 18,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011031/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17702",
    						name: "Agent X (2002) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17709",
    						name: "Agent X (2002) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17710",
    						name: "Agent X (2002) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17711",
    						name: "Agent X (2002) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17712",
    						name: "Agent X (2002) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17713",
    						name: "Agent X (2002) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17714",
    						name: "Agent X (2002) #7"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17715",
    						name: "Agent X (2002) #8"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17716",
    						name: "Agent X (2002) #9"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17703",
    						name: "Agent X (2002) #10"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17704",
    						name: "Agent X (2002) #11"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17705",
    						name: "Agent X (2002) #12"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17706",
    						name: "Agent X (2002) #13"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17707",
    						name: "Agent X (2002) #14"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/394",
    						name: "Agent X (2002) #15"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/1649",
    						name: "Cable & Deadpool (2004) #12"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21845",
    						name: "Cable & Deadpool (2004) #46 (Zombie Variant)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5761",
    						name: "Cable & Deadpool Vol. 2: The Burnt Offering (Trade Paperback)"
    					}
    				],
    				returned: 18
    			},
    			series: {
    				available: 3,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011031/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/459",
    						name: "Agent X (2002 - 2004)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/693",
    						name: "Cable & Deadpool (2004 - 2008)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1338",
    						name: "Cable & Deadpool Vol. 2: The Burnt Offering (2007)"
    					}
    				],
    				returned: 3
    			},
    			stories: {
    				available: 23,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011031/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1135",
    						name: "AGENT X (2002) #15",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2484",
    						name: "CABLE & DEADPOOL (2004) #12",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37514",
    						name: "AGENT X (2002) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37515",
    						name: "Dead Man's Switch Part One",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37516",
    						name: "AGENT X (2002) #10",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37518",
    						name: "AGENT X (2002) #11",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37521",
    						name: "AGENT X (2002) #13",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37523",
    						name: "AGENT X (2002) #14",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37525",
    						name: "AGENT X (2002) #2",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37526",
    						name: "Dead Man's Switch Part Two",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37527",
    						name: "AGENT X (2002) #3",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37528",
    						name: "Dead Man's Switch Part Three",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37529",
    						name: "AGENT X (2002) #4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37530",
    						name: "Dead Man's Switch Part Four",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37531",
    						name: "AGENT X (2002) #5",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37532",
    						name: "Dead Man's Switch Part Five",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37533",
    						name: "AGENT X (2002) #6",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37534",
    						name: "Dead Man's Switch Part Six",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37535",
    						name: "AGENT X (2002) #7",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/67703",
    						name: "AGENT X (2002) #12",
    						type: "cover"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011031/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/101/agent_x?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Agent_X_(Nijo)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011031/agent_x_nijo?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1009150,
    			name: "Agent Zero",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/f/60/4c0042121d790",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1009150",
    			comics: {
    				available: 28,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009150/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/18082",
    						name: "Weapon X (2002) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/18092",
    						name: "Weapon X (2002) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/18074",
    						name: "Weapon X (2002) #12"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/246",
    						name: "Weapon X (2002) #13"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/2204",
    						name: "Weapon X: Days of Future Now (2005) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/2324",
    						name: "Weapon X: Days of Future Now (2005) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/2438",
    						name: "Weapon X: Days of Future Now (2005) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/2439",
    						name: "Weapon X: Days of Future Now (2005) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/3016",
    						name: "Weapon X: Days of Future Now (2005) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/3357",
    						name: "Weapon X: Days of Future Now (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/18408",
    						name: "Weapon X: The Draft – Agent Zero (2002) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14182",
    						name: "Wolverine (1988) #60"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14183",
    						name: "Wolverine (1988) #61"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14184",
    						name: "Wolverine (1988) #62"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14185",
    						name: "Wolverine (1988) #63"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14186",
    						name: "Wolverine (1988) #64"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14189",
    						name: "Wolverine (1988) #67"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14190",
    						name: "Wolverine (1988) #68"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14211",
    						name: "Wolverine (1988) #87"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14107",
    						name: "Wolverine (1988) #163"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 9,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009150/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/543",
    						name: "Weapon X (2002 - 2004)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/869",
    						name: "Weapon X: Days of Future Now (2005)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1478",
    						name: "Weapon X: Days of Future Now (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3649",
    						name: "Weapon X: The Draft – Agent Zero (2002)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2262",
    						name: "Wolverine (1988 - 2003)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/84",
    						name: "WOLVERINE/DEADPOOL: WEAPON X TPB (1999)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3643",
    						name: "X-Man (1995 - 2000)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2265",
    						name: "X-Men (1991 - 2001)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3637",
    						name: "X-Men Unlimited (1993 - 2003)"
    					}
    				],
    				returned: 9
    			},
    			stories: {
    				available: 30,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009150/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1131",
    						name: "WEAPON X (2002) #13",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/4603",
    						name: "1 of 5 - 5XLS",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/4605",
    						name: "2 of 5 - 5XLS",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/4606",
    						name: "3 of 5 - 5XLS",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/4608",
    						name: "4 of 5 - 5XLS",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/4610",
    						name: "5 of 5 - 5XLS",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28706",
    						name: "The Hunted Part 2",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28712",
    						name: "The Hunted Part 5",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28738",
    						name: "The Logan Files Epilogue",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28881",
    						name: "Counting Coup",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28883",
    						name: "Nightmare Quest!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28885",
    						name: "Reunion!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28887",
    						name: "Bastions of Glory!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28889",
    						name: "What Goes Around...",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28895",
    						name: "Valley O' Death",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28897",
    						name: "Epsilon Red",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28941",
    						name: "Showdown In Lowtown",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/29125",
    						name: "Last Stand",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/29139",
    						name: "Over...Again",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/38511",
    						name: "Second Contact",
    						type: "interiorStory"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009150/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/102/agent_zero?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Agent_Zero?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1009150/agent_zero?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011198,
    			name: "Agents of Atlas",
    			description: "",
    			modified: "2016-02-03T10:25:22-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/9/a0/4ce18a834b7f5",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011198",
    			comics: {
    				available: 45,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011198/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/23659",
    						name: "Agents of Atlas (2009) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/4801",
    						name: "Agents of Atlas (2006) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/77001",
    						name: "Agents of Atlas (2019) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/23660",
    						name: "Agents of Atlas (2009) #1 (50/50 COVER)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5089",
    						name: "Agents of Atlas (2006) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/23825",
    						name: "Agents of Atlas (2009) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/27402",
    						name: "Agents of Atlas (2009) #2 (BACHALO 2ND PRINTING VARIANT)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/23824",
    						name: "Agents of Atlas (2009) #2 (MCGUINNESS VARIANT)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5241",
    						name: "Agents of Atlas (2006) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24015",
    						name: "Agents of Atlas (2009) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24016",
    						name: "Agents of Atlas (2009) #3 (MCGUINNESS VARIANT)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24017",
    						name: "Agents of Atlas (2009) #3 (Wolverine Art Appreciation Variant)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5404",
    						name: "Agents of Atlas (2006) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24219",
    						name: "Agents of Atlas (2009) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24221",
    						name: "Agents of Atlas (2009) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5665",
    						name: "Agents of Atlas (2006) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24222",
    						name: "Agents of Atlas (2009) #5 (MCGUINNESS VARIANT)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24360",
    						name: "Agents of Atlas (2009) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5842",
    						name: "Agents of Atlas (2006) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24361",
    						name: "Agents of Atlas (2009) #7"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 13,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011198/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1097",
    						name: "Agents of Atlas (2006 - 2007)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/6807",
    						name: "Agents of Atlas (2009)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/27624",
    						name: "Agents of Atlas (2019)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1980",
    						name: "AGENTS OF ATLAS PREMIERE HC (2007)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24134",
    						name: "Agents of Atlas: The Complete Collection Vol. 1 (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/29600",
    						name: "Atlantis Attacks (2020)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/9782",
    						name: "Atlas (2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/9181",
    						name: "Avengers Vs. Atlas (2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/6415",
    						name: "Dark Reign: New Nation (2008)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/27620",
    						name: "Incoming! (2019)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/27505",
    						name: "War of the Realms: New Agents of Atlas (2019)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/27374",
    						name: "War Of The Realms: New Agents Of Atlas (2019)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22365",
    						name: "Wolverine: Prehistory (2017)"
    					}
    				],
    				returned: 13
    			},
    			stories: {
    				available: 52,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011198/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/6008",
    						name: "1 of 6 - 6 XLS-",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/6009",
    						name: "1 of 6 - 6 XLS-",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/6010",
    						name: "2 of 6 - 6 XLS -",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/6011",
    						name: "2 of 6 - 6 XLS -",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/6012",
    						name: "3 of 6 - 6 XLS -",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/6013",
    						name: "3 of 6 - 6 XLS -",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/6014",
    						name: "4 of 6 - 6 XLS -",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/6015",
    						name: "4 of 6 - 6 XLS -",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/6016",
    						name: "5 of 6 - 6 XLS -",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/6017",
    						name: "5 of 6 - 6 XLS -",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/6018",
    						name: "5 of 6 - Story A - 6XLS",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/6019",
    						name: "5 of 6 - Story A - 6XLS",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/51050",
    						name: "1 of 1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/52393",
    						name: "1 of 3",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/52395",
    						name: "1 of 3",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/52861",
    						name: "2 of 3",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/52863",
    						name: "2 of 3",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/53263",
    						name: "3 of 3",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/53265",
    						name: "3 of 3",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/53266",
    						name: "3 of 3",
    						type: "interiorStory"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011198/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/318",
    						name: "Dark Reign"
    					}
    				],
    				returned: 1
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/comics/characters/1011198/agents_of_atlas?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Agents_of_Atlas?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011198/agents_of_atlas?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011175,
    			name: "Aginar",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011175",
    			comics: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011175/comics",
    				items: [
    				],
    				returned: 0
    			},
    			series: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011175/series",
    				items: [
    				],
    				returned: 0
    			},
    			stories: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011175/stories",
    				items: [
    				],
    				returned: 0
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011175/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/105/aginar?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Aginar?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011175/aginar?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011136,
    			name: "Air-Walker (Gabriel Lan)",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011136",
    			comics: {
    				available: 4,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011136/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/4108",
    						name: "Annihilation: Silver Surfer (2006) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5589",
    						name: "Heroes Reborn: Iron Man (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/16330",
    						name: "Iron Man (1996) #11"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/16331",
    						name: "Iron Man (1996) #12"
    					}
    				],
    				returned: 4
    			},
    			series: {
    				available: 3,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011136/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1078",
    						name: "Annihilation: Silver Surfer (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1814",
    						name: "Heroes Reborn: Iron Man (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13577",
    						name: "Iron Man (1996 - 1998)"
    					}
    				],
    				returned: 3
    			},
    			stories: {
    				available: 3,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011136/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5925",
    						name: "Annihilation: Silver Surfer (2006) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/34082",
    						name: "Magical Mystery Tour",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/34085",
    						name: "Matters of the Heart",
    						type: "interiorStory"
    					}
    				],
    				returned: 3
    			},
    			events: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011136/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/229",
    						name: "Annihilation"
    					}
    				],
    				returned: 1
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/109/air-walker?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Air-Walker_(Gabriel_Lan)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011136/air-walker_gabriel_lan?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		}
    	]
    };
    var page1 = {
    	code: code$2,
    	status: status$2,
    	copyright: copyright$2,
    	attributionText: attributionText$2,
    	attributionHTML: attributionHTML$2,
    	etag: etag$2,
    	data: data$2
    };

    var code$1 = 200;
    var status$1 = "Ok";
    var copyright$1 = "© 2021 MARVEL";
    var attributionText$1 = "Data provided by Marvel. © 2021 MARVEL";
    var attributionHTML$1 = "<a href=\"http://marvel.com\">Data provided by Marvel. © 2021 MARVEL</a>";
    var etag$1 = "a485977a23bea171db65f8c42e36eed5f509b97d";
    var data$1 = {
    	offset: 20,
    	limit: 20,
    	total: 1559,
    	count: 20,
    	results: [
    		{
    			id: 1011176,
    			name: "Ajak",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/2/80/4c002f35c5215",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011176",
    			comics: {
    				available: 4,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011176/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21175",
    						name: "Incredible Hercules (2008) #117"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21324",
    						name: "Incredible Hercules (2008) #118"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21505",
    						name: "Incredible Hercules (2008) #119"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21707",
    						name: "Incredible Hercules (2008) #120"
    					}
    				],
    				returned: 4
    			},
    			series: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011176/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3762",
    						name: "Incredible Hercules (2008 - 2010)"
    					}
    				],
    				returned: 1
    			},
    			stories: {
    				available: 8,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011176/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/46776",
    						name: "Incredible Hercules (2008) #117",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/46777",
    						name: "Interior #46777",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47097",
    						name: "Incredible Hercules (2008) #118",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47098",
    						name: "Interior #47098",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47415",
    						name: "Incredible Hercules (2008) #119",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47416",
    						name: "3 of 4 - Secret Invasion",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47721",
    						name: "Incredible Hercules (2008) #120",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47722",
    						name: "4 of 4 - Secret Invasion",
    						type: "interiorStory"
    					}
    				],
    				returned: 8
    			},
    			events: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011176/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/269",
    						name: "Secret Invasion"
    					}
    				],
    				returned: 1
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/111/ajak?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Ajak?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011176/ajak?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1010870,
    			name: "Ajaxis",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/70/4c0035adc7d3a",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1010870",
    			comics: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010870/comics",
    				items: [
    				],
    				returned: 0
    			},
    			series: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010870/series",
    				items: [
    				],
    				returned: 0
    			},
    			stories: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010870/stories",
    				items: [
    				],
    				returned: 0
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010870/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/113/ajaxis?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Ajaxis?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1010870/ajaxis?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011194,
    			name: "Akemi",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011194",
    			comics: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011194/comics",
    				items: [
    				],
    				returned: 0
    			},
    			series: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011194/series",
    				items: [
    				],
    				returned: 0
    			},
    			stories: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011194/stories",
    				items: [
    				],
    				returned: 0
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011194/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/114/akemi?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011194/akemi?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011170,
    			name: "Alain",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011170",
    			comics: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011170/comics",
    				items: [
    				],
    				returned: 0
    			},
    			series: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011170/series",
    				items: [
    				],
    				returned: 0
    			},
    			stories: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011170/stories",
    				items: [
    				],
    				returned: 0
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011170/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/116/alain?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Alain?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011170/alain?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1009240,
    			name: "Albert Cleary",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1009240",
    			comics: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009240/comics",
    				items: [
    				],
    				returned: 0
    			},
    			series: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009240/series",
    				items: [
    				],
    				returned: 0
    			},
    			stories: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009240/stories",
    				items: [
    				],
    				returned: 0
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009240/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/2692/albert_cleary?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1009240/albert_cleary?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011120,
    			name: "Albion",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011120",
    			comics: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011120/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/16489",
    						name: "New Excalibur (2005) #23"
    					}
    				],
    				returned: 1
    			},
    			series: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011120/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/935",
    						name: "New Excalibur (2005 - 2007)"
    					}
    				],
    				returned: 1
    			},
    			stories: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011120/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/33247",
    						name: "NEW EXCALIBUR (2005) #23",
    						type: "cover"
    					}
    				],
    				returned: 1
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011120/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/118/albion?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Albion?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011120/albion?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1010836,
    			name: "Alex Power",
    			description: "",
    			modified: "2011-10-27T09:57:58-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/9/50/4ce5a385a2e82",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1010836",
    			comics: {
    				available: 18,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010836/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/78439",
    						name: "Future Foundation (2019) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/79184",
    						name: "Future Foundation (2019) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/79185",
    						name: "Future Foundation (2019) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/79186",
    						name: "Future Foundation (2019) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17285",
    						name: "Iron Man and Power Pack (2007) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17417",
    						name: "Iron Man and Power Pack (2007) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17652",
    						name: "Iron Man and Power Pack (2007) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20697",
    						name: "Iron Man and Power Pack (2007) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/65092",
    						name: "Power Pack (2017) #63"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/31366",
    						name: "Thor and the Warriors Four (2010) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/31368",
    						name: "Thor and the Warriors Four (2010) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/31370",
    						name: "Thor and the Warriors Four (2010) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/31372",
    						name: "Thor and the Warriors Four (2010) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/2565",
    						name: "X-Men and Power Pack (2005) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/3093",
    						name: "X-Men and Power Pack (2005) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/3207",
    						name: "X-Men and Power Pack (2005) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/3416",
    						name: "X-Men and Power Pack (2005) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/4060",
    						name: "X-Men and Power Pack: The Power of X (Digest)"
    					}
    				],
    				returned: 18
    			},
    			series: {
    				available: 6,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010836/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/27824",
    						name: "Future Foundation (2019 - Present)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3077",
    						name: "Iron Man and Power Pack (2007 - 2008)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23679",
    						name: "Power Pack (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/9731",
    						name: "Thor and the Warriors Four (2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/970",
    						name: "X-Men and Power Pack (2005 - 2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1634",
    						name: "X-Men and Power Pack: The Power of X (2006)"
    					}
    				],
    				returned: 6
    			},
    			stories: {
    				available: 25,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010836/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5463",
    						name: "X-Men and Power Pack (2005) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5464",
    						name: "1 of 4 - 4XLS",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5465",
    						name: "X-Men and Power Pack (2005) #2",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5466",
    						name: "2 of 4 - 4XLS",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5467",
    						name: "X-Men and Power Pack (2005) #3",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5468",
    						name: "3 of 4 - 4XLS",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5469",
    						name: "X-Men and Power Pack (2005) #4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5470",
    						name: "4 of 4 - 4XLS",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/36224",
    						name: "Iron Man and Power Pack (2007) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/36225",
    						name: "4XLS 1 of 4",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/36519",
    						name: "Iron Man and Power Pack (2007) #2",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/36520",
    						name: "4XLS 2 of 4",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/36949",
    						name: "Iron Man and Power Pack (2007) #3",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/36950",
    						name: "4XLS 3 of 4",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44388",
    						name: "Iron Man and Power Pack (2007) #4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44389",
    						name: "4XLS 4 of 4",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/71416",
    						name: "Thor and the Warriors Four (2010) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/71420",
    						name: "Thor and the Warriors Four (2010) #2",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/71424",
    						name: "Thor and the Warriors Four (2010) #3",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/71428",
    						name: "Thor and the Warriors Four (2010) #4",
    						type: "cover"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010836/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/1387/alex_power?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1010836/alex_power?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1010755,
    			name: "Alex Wilder",
    			description: "Despite being the only one of the Runaways without any superhuman abilities or tech, Alex Wilder became the de facto leader of the group due to his natural leadership skills and intellect, as well as prodigy-level logic and strategy.",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/2/c0/4c00377144d5a",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1010755",
    			comics: {
    				available: 9,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010755/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/60754",
    						name: "Power Man and Iron Fist (2016) #14"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15061",
    						name: "Runaways (2003) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15071",
    						name: "Runaways (2003) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15072",
    						name: "Runaways (2003) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15073",
    						name: "Runaways (2003) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15074",
    						name: "Runaways (2003) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15075",
    						name: "Runaways (2003) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/70566",
    						name: "Runaways (2017) #17"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/1273",
    						name: "Runaways Vol. 1: Pride & Joy (Digest)"
    					}
    				],
    				returned: 9
    			},
    			series: {
    				available: 4,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010755/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/21122",
    						name: "Power Man and Iron Fist (2016 - 2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2584",
    						name: "Runaways (2003 - 2004)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23461",
    						name: "Runaways (2017 - Present)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/327",
    						name: "Runaways Vol. 1: Pride & Joy (2004)"
    					}
    				],
    				returned: 4
    			},
    			stories: {
    				available: 9,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010755/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/30606",
    						name: "Pride and Joy, Part 1 of 6",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/30622",
    						name: "Cover #30622",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/30623",
    						name: "Pride and Joy, Part 2 of 6",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/30625",
    						name: "Pride and Joy, Part 3 of 6",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/30627",
    						name: "Pride and Joy, Part 4 of 6",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/30629",
    						name: "Pride and Joy, Part 5 of 6",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/30631",
    						name: "Pride and Joy, Part 6 of 6",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/131977",
    						name: "cover from Power Man and Iron Fist (2016) #14",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/156957",
    						name: "cover from Runaways (2017) #17",
    						type: "cover"
    					}
    				],
    				returned: 9
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010755/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/2820/alex_wilder?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Wilder%2C_Alex?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1010755/alex_wilder?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011214,
    			name: "Alexa Mendez",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011214",
    			comics: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011214/comics",
    				items: [
    				],
    				returned: 0
    			},
    			series: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011214/series",
    				items: [
    				],
    				returned: 0
    			},
    			stories: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011214/stories",
    				items: [
    				],
    				returned: 0
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011214/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/2892/alexa_mendez?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011214/alexa_mendez?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1009497,
    			name: "Alexander Pierce",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1009497",
    			comics: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009497/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/26285",
    						name: "Secret Warriors (2009) #12"
    					}
    				],
    				returned: 1
    			},
    			series: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009497/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/6796",
    						name: "Secret Warriors (2009 - 2011)"
    					}
    				],
    				returned: 1
    			},
    			stories: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009497/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/57873",
    						name: "Secret Warriors (2008) #12",
    						type: "interiorStory"
    					}
    				],
    				returned: 1
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009497/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/2738/alexander_pierce?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1009497/alexander_pierce?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1014990,
    			name: "Alice",
    			description: "",
    			modified: "2010-11-18T16:01:44-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/6/70/4cd061e6d6573",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1014990",
    			comics: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1014990/comics",
    				items: [
    				],
    				returned: 0
    			},
    			series: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1014990/series",
    				items: [
    				],
    				returned: 0
    			},
    			stories: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1014990/stories",
    				items: [
    				],
    				returned: 0
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1014990/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/122/alice?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1014990/alice?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1009435,
    			name: "Alicia Masters",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/4c003d40ac7ae",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1009435",
    			comics: {
    				available: 60,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009435/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/2055",
    						name: "Essential Fantastic Four Vol. 4 (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15546",
    						name: "Fantastic Four (1998) #27"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12965",
    						name: "Fantastic Four (1961) #163"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12966",
    						name: "Fantastic Four (1961) #164"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12970",
    						name: "Fantastic Four (1961) #168"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12971",
    						name: "Fantastic Four (1961) #169"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12973",
    						name: "Fantastic Four (1961) #170"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13056",
    						name: "Fantastic Four (1961) #245"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13062",
    						name: "Fantastic Four (1961) #250"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13063",
    						name: "Fantastic Four (1961) #251"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13064",
    						name: "Fantastic Four (1961) #252"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13067",
    						name: "Fantastic Four (1961) #255"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13068",
    						name: "Fantastic Four (1961) #256"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13141",
    						name: "Fantastic Four (1961) #321"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13142",
    						name: "Fantastic Four (1961) #322"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13146",
    						name: "Fantastic Four (1961) #326"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13147",
    						name: "Fantastic Four (1961) #327"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13148",
    						name: "Fantastic Four (1961) #328"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13149",
    						name: "Fantastic Four (1961) #329"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13153",
    						name: "Fantastic Four (1961) #332"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 20,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009435/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1263",
    						name: "Essential Fantastic Four Vol. 4 (2005)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2121",
    						name: "Fantastic Four (1961 - 1998)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/421",
    						name: "Fantastic Four (1998 - 2012)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3292",
    						name: "Fantastic Four 1 2 3 4 (2001)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2012",
    						name: "Fantastic Four Annual (1963 - 1994)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3090",
    						name: "Fantastic Four Omnibus Vol. 1 (2007)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1458",
    						name: "FANTASTIC FOUR VISIONARIES: GEORGE PEREZ VOL. 1 TPB (2005)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/341",
    						name: "FANTASTIC FOUR VISIONARIES: JOHN BYRNE VOL. 2 TPB (2004)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1424",
    						name: "Fantastic Four Visionaries: John Byrne Vol. 3 (2004)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2254",
    						name: "FANTASTIC FOUR VISIONARIES: WALTER SIMONSON VOL. 1 TPB (2007)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1266",
    						name: "Fantastic Four Vol. 2 (2005)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/25306",
    						name: "Fantastic Four Vol. 2: Mr. And Mrs. Grimm (2019)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2579",
    						name: "Fantastic Four: 1234 (2001 - 2002)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/14102",
    						name: "Fear Itself: FF (2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/20424",
    						name: "Galactus the Devourer (1999 - 2000)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1346",
    						name: "Marvel Masterworks: The Fantastic Four Vol. 7 (2004)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3715",
    						name: "Marvel Two-in-One (1974 - 1983)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3667",
    						name: "Thing (1983 - 1986)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2085",
    						name: "Universe X (2000 - 2001)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3657",
    						name: "Universe X Special: 4 (2001)"
    					}
    				],
    				returned: 20
    			},
    			stories: {
    				available: 84,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009435/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/802",
    						name: "Fantastic Four (1998) #509",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/803",
    						name: "Interior #803",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/912",
    						name: "Fantastic Four (1998) #512",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/913",
    						name: "Interior #913",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12548",
    						name: "Fantastic Four (1961) #163",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12549",
    						name: "Finale!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12550",
    						name: "Fantastic Four (1961) #164",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12551",
    						name: "The Crusader Syndrome!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12558",
    						name: "Fantastic Four (1961) #168",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12559",
    						name: "Where Have All the Powers Gone?",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12560",
    						name: "Fantastic Four (1961) #169",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12561",
    						name: "Five Characters in Search of a Madman!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12564",
    						name: "Fantastic Four (1961) #170",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12565",
    						name: "A Sky Full of Fear!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12753",
    						name: "Fantastic Four (1961) #245",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12754",
    						name: "Childhood's End",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12765",
    						name: "Fantastic Four (1961) #250",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12766",
    						name: "X-Factor",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12768",
    						name: "Fantastic Four (1961) #251",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12769",
    						name: "Into the Negative Zone",
    						type: "interiorStory"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 2,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009435/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/116",
    						name: "Acts of Vengeance!"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/252",
    						name: "Inferno"
    					}
    				],
    				returned: 2
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/2732/alicia_masters?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Masters%2C_Alicia?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1009435/alicia_masters?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1010370,
    			name: "Alpha Flight",
    			description: "",
    			modified: "2013-10-24T13:09:22-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/1/60/52695277ee088",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1010370",
    			comics: {
    				available: 208,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010370/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/39654",
    						name: "Alpha Flight (2011) #0.1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12637",
    						name: "Alpha Flight (1983) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/393",
    						name: "Alpha Flight (2004) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/39819",
    						name: "Alpha Flight (2011) #1 (Eaglesham Variant)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12679",
    						name: "Alpha Flight (1983) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/38569",
    						name: "Alpha Flight (2011) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/456",
    						name: "Alpha Flight (2004) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/39818",
    						name: "Alpha Flight (2011) #2 (Eaglesham Variant)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12690",
    						name: "Alpha Flight (1983) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/616",
    						name: "Alpha Flight (2004) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/39820",
    						name: "Alpha Flight (2011) #3 (Eaglesham Variant)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/677",
    						name: "Alpha Flight (2004) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12701",
    						name: "Alpha Flight (1983) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/38567",
    						name: "Alpha Flight (2011) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12712",
    						name: "Alpha Flight (1983) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/613",
    						name: "Alpha Flight (2004) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/38568",
    						name: "Alpha Flight (2011) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/38566",
    						name: "Alpha Flight (2011) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/572",
    						name: "Alpha Flight (2004) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12723",
    						name: "Alpha Flight (1983) #6"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 40,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010370/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/719",
    						name: "Alpha Flight (2004 - 2005)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13907",
    						name: "Alpha Flight (2011 - 2012)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2116",
    						name: "Alpha Flight (1983 - 1994)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/27041",
    						name: "Alpha Flight Facsimile Edition (2019)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/27625",
    						name: "Alpha Flight: True North (2019)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/28069",
    						name: "Annihilation: Scourge (2020)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/744",
    						name: "Astonishing X-Men (2004 - 2013)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1991",
    						name: "Avengers (1963 - 1996)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1995",
    						name: "Cable (1993 - 2002)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/20718",
    						name: "Captain Marvel (2016 - 2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22552",
    						name: "Champions (2016 - 2019)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/11854",
    						name: "Chaos War (2010 - 2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13468",
    						name: "Chaos War One-Shots (2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13260",
    						name: "Chaos War: Alpha Flight (2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/21692",
    						name: "Civil War II: Choosing Sides (2016)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/14399",
    						name: "Essential X-Men Vol. 2 (All-New Edition) (2011 - Present)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2123",
    						name: "Fantastic Four (1996 - 1997)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2121",
    						name: "Fantastic Four (1961 - 1998)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/20465",
    						name: "Guardians of the Galaxy (2015 - 2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1812",
    						name: "Heroes Reborn: Fantastic Four (2006)"
    					}
    				],
    				returned: 20
    			},
    			stories: {
    				available: 378,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010370/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2921",
    						name: "Alpha Flight (2004) #9",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2922",
    						name: "1 of 4 - Days of Future Present Past Participle",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2923",
    						name: "Alpha Flight (2004) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2924",
    						name: "Interior #2924",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2925",
    						name: "Alpha Flight (2004) #2",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2926",
    						name: "Interior #2926",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2927",
    						name: "Alpha Flight (2004) #6",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2928",
    						name: "Interior #2928",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2929",
    						name: "Alpha Flight (2004) #5",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2930",
    						name: "Interior #2930",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2931",
    						name: "Alpha Flight (2004) #3",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2932",
    						name: "Interior #2932",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2933",
    						name: "Alpha Flight (2004) #4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2934",
    						name: "Interior #2934",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2935",
    						name: "Alpha Flight (2004) #7",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2936",
    						name: "\"WAXING POETIC\" PART 1 (OF 2) Is the All-New, All-Different Alpha Flight really disbanding after only seven issues? Not if the r",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2937",
    						name: "Alpha Flight (2004) #8",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2938",
    						name: "\"WAXING POETIC\" PART 2 (OF 2) Montreal faces its gravest hour as it falls under attack by…wax statues of the entire Marvel Unive",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2939",
    						name: "Alpha Flight (2004) #10",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2940",
    						name: "2 of 4 - Days of Future Present Past Participle",
    						type: "interiorStory"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 7,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010370/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/116",
    						name: "Acts of Vengeance!"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/296",
    						name: "Chaos War"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/302",
    						name: "Fear Itself"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/29",
    						name: "Infinity War"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/337",
    						name: "Monsters Unleashed"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/333",
    						name: "Monsters Unleashed"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/271",
    						name: "Secret Wars II"
    					}
    				],
    				returned: 7
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/comics/characters/1010370/alpha_flight?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Alpha_Flight?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1010370/alpha_flight?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011324,
    			name: "Alpha Flight (Ultimate)",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011324",
    			comics: {
    				available: 2,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011324/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21177",
    						name: "Ultimate X-Men (2001) #94"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21326",
    						name: "Ultimate X-Men (2001) #95"
    					}
    				],
    				returned: 2
    			},
    			series: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011324/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/474",
    						name: "Ultimate X-Men (2001 - 2009)"
    					}
    				],
    				returned: 1
    			},
    			stories: {
    				available: 4,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011324/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/46780",
    						name: "Ultimate X-Men (2001) #94",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/46781",
    						name: "1 of 4",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47101",
    						name: "Ultimate X-Men (2001) #95",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47102",
    						name: "2 of 4",
    						type: "interiorStory"
    					}
    				],
    				returned: 4
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011324/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/126/alpha_flight?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Alpha%20Flight%20(Ultimate)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011324/alpha_flight_ultimate?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011164,
    			name: "Alvin Maker",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011164",
    			comics: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011164/comics",
    				items: [
    				],
    				returned: 0
    			},
    			series: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011164/series",
    				items: [
    				],
    				returned: 0
    			},
    			stories: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011164/stories",
    				items: [
    				],
    				returned: 0
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011164/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/2880/alvin_maker?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011164/alvin_maker?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011227,
    			name: "Amadeus Cho",
    			description: "",
    			modified: "2013-08-07T13:50:56-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/3/80/520288b9cb581",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011227",
    			comics: {
    				available: 148,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011227/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/77001",
    						name: "Agents of Atlas (2019) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/77002",
    						name: "Agents of Atlas (2019) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/77004",
    						name: "Agents of Atlas (2019) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/77005",
    						name: "Agents of Atlas (2019) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/83994",
    						name: "Atlantis Attacks (2020) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/83995",
    						name: "Atlantis Attacks (2020) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/83996",
    						name: "Atlantis Attacks (2020) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/65264",
    						name: "Avengers (2016) #674"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/61442",
    						name: "Champions (2016) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/61443",
    						name: "Champions (2016) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/73805",
    						name: "Champions (2019) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/73806",
    						name: "Champions (2019) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/61444",
    						name: "Champions (2016) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/61445",
    						name: "Champions (2016) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/73807",
    						name: "Champions (2019) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/61446",
    						name: "Champions (2016) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/81193",
    						name: "Champions (2020) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/61447",
    						name: "Champions (2016) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/61448",
    						name: "Champions (2016) #7"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/61449",
    						name: "Champions (2016) #8"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 33,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011227/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/27624",
    						name: "Agents of Atlas (2019)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/29600",
    						name: "Atlantis Attacks (2020)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22547",
    						name: "Avengers (2016 - 2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22552",
    						name: "Champions (2016 - 2019)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/29034",
    						name: "Champions (2020)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/26592",
    						name: "Champions (2019 - Present)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22755",
    						name: "CHAMPIONS VOL. 1: CHANGE THE WORLD TPB (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22756",
    						name: "Champions Vol. 2: The Freelancer Lifestyle (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24137",
    						name: "Domino (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13881",
    						name: "Fear Itself: The Home Front (2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23684",
    						name: "Generations (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23281",
    						name: "Generations: Banner Hulk & The Totally Awesome Hulk (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/20866",
    						name: "Ghost Rider (2016 - 2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/20867",
    						name: "GHOST RIDER: FOUR ON THE FLOOR TPB (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/9350",
    						name: "Hercules: Fall of an Avenger (2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23453",
    						name: "Hulk: Planet Hulk Omnibus (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24832",
    						name: "Hulk: Return to Planet Hulk (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3762",
    						name: "Incredible Hercules (2008 - 2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23635",
    						name: "Incredible Hulk (2017 - 2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/8842",
    						name: "Incredible Hulks (2010 - 2011)"
    					}
    				],
    				returned: 20
    			},
    			stories: {
    				available: 174,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011227/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44255",
    						name: "Incredible Hercules (2008) #114",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44256",
    						name: "Herc 3 of 4",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44605",
    						name: "Incredible Hercules (2008) #115",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44606",
    						name: "Herc 4 of 4",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44607",
    						name: "Herc 4 of 4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/45230",
    						name: "Incredible Hercules (2008) #116",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/45231",
    						name: "Interior #45231",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/46776",
    						name: "Incredible Hercules (2008) #117",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/46777",
    						name: "Interior #46777",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47097",
    						name: "Incredible Hercules (2008) #118",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47098",
    						name: "Interior #47098",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47415",
    						name: "Incredible Hercules (2008) #119",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47416",
    						name: "3 of 4 - Secret Invasion",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47721",
    						name: "Incredible Hercules (2008) #120",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47722",
    						name: "4 of 4 - Secret Invasion",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/48208",
    						name: "Incredible Hercules (2008) #121",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/48209",
    						name: "1 of 4",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/49032",
    						name: "Incredible Hercules (2008) #122",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/49033",
    						name: "2 of 4",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/49816",
    						name: "Incredible Hercules (2008) #123",
    						type: "cover"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 5,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011227/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/318",
    						name: "Dark Reign"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/302",
    						name: "Fear Itself"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/336",
    						name: "Secret Empire"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/269",
    						name: "Secret Invasion"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/273",
    						name: "Siege"
    					}
    				],
    				returned: 5
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/comics/characters/1011227/amadeus_cho?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Amadeus_Cho?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011227/amadeus_cho?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1009567,
    			name: "Amanda Sefton",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1009567",
    			comics: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009567/comics",
    				items: [
    				],
    				returned: 0
    			},
    			series: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009567/series",
    				items: [
    				],
    				returned: 0
    			},
    			stories: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009567/stories",
    				items: [
    				],
    				returned: 0
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009567/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/2755/amanda_sefton?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1009567/amanda_sefton?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011382,
    			name: "Amazoness",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011382",
    			comics: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011382/comics",
    				items: [
    				],
    				returned: 0
    			},
    			series: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011382/series",
    				items: [
    				],
    				returned: 0
    			},
    			stories: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011382/stories",
    				items: [
    				],
    				returned: 0
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011382/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/130/amazoness?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011382/amazoness?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011361,
    			name: "American Eagle (Jason Strongbow)",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/f/80/4ce5a6d8b8f2a",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011361",
    			comics: {
    				available: 5,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011361/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/10105",
    						name: "Marvel Comics Presents (1988) #27"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/10042",
    						name: "Marvel Comics Presents (1988) #128"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/10045",
    						name: "Marvel Comics Presents (1988) #130"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/10063",
    						name: "Marvel Comics Presents (1988) #147"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/10064",
    						name: "Marvel Comics Presents (1988) #148"
    					}
    				],
    				returned: 5
    			},
    			series: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011361/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2039",
    						name: "Marvel Comics Presents (1988 - 1995)"
    					}
    				],
    				returned: 1
    			},
    			stories: {
    				available: 5,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011361/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/22862",
    						name: "The Hunter and the Hunted",
    						type: ""
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/22880",
    						name: "Screams",
    						type: ""
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/22990",
    						name: "Saints and Sinner",
    						type: ""
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/22996",
    						name: "500 Guns",
    						type: ""
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/23237",
    						name: "Just Another Shade of Hate",
    						type: ""
    					}
    				],
    				returned: 5
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011361/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/132/american_eagle?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/American_Eagle_(Jason_Strongbow)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011361/american_eagle_jason_strongbow?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1009151,
    			name: "Amiko",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1009151",
    			comics: {
    				available: 12,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009151/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/62744",
    						name: "Elektra (1996) #15"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13722",
    						name: "Uncanny X-Men (1963) #181"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14206",
    						name: "Wolverine (1988) #82"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14045",
    						name: "Wolverine (1988) #107"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14046",
    						name: "Wolverine (1988) #108"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14047",
    						name: "Wolverine (1988) #109"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14093",
    						name: "Wolverine (1988) #150"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14094",
    						name: "Wolverine (1988) #151"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14095",
    						name: "Wolverine (1988) #152"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14096",
    						name: "Wolverine (1988) #153"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14118",
    						name: "Wolverine (1988) #173"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14119",
    						name: "Wolverine (1988) #174"
    					}
    				],
    				returned: 12
    			},
    			series: {
    				available: 3,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009151/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23024",
    						name: "Elektra (1996 - 1998)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2258",
    						name: "Uncanny X-Men (1963 - 2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2262",
    						name: "Wolverine (1988 - 2003)"
    					}
    				],
    				returned: 3
    			},
    			stories: {
    				available: 12,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009151/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/27872",
    						name: "Tokyo Story",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28580",
    						name: "Once Upon a Time in Little Tokyo",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28582",
    						name: "East is East",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28584",
    						name: "[Untitled]",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28677",
    						name: "Blood Debt Part 1",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28680",
    						name: "Blood Debt Part 2",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28682",
    						name: "Blood Debt Part 3",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28684",
    						name: "Blood Debt Part 4",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28729",
    						name: "The Logan Files Part 1",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28732",
    						name: "The Logan Files Part 2",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/28931",
    						name: "Omnia Mutantur",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/156489",
    						name: "cover to Elektra (1996) #15",
    						type: "cover"
    					}
    				],
    				returned: 12
    			},
    			events: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009151/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/270",
    						name: "Secret Wars"
    					}
    				],
    				returned: 1
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/134/amiko?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Amiko?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1009151/amiko?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		}
    	]
    };
    var page2 = {
    	code: code$1,
    	status: status$1,
    	copyright: copyright$1,
    	attributionText: attributionText$1,
    	attributionHTML: attributionHTML$1,
    	etag: etag$1,
    	data: data$1
    };

    var code = 200;
    var status = "Ok";
    var copyright = "© 2021 MARVEL";
    var attributionText = "Data provided by Marvel. © 2021 MARVEL";
    var attributionHTML = "<a href=\"http://marvel.com\">Data provided by Marvel. © 2021 MARVEL</a>";
    var etag = "4be576194c7c14a3ceb535cc3879eb8be8ab42b6";
    var data = {
    	offset: 40,
    	limit: 20,
    	total: 1559,
    	count: 20,
    	results: [
    		{
    			id: 1010672,
    			name: "Amora",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1010672",
    			comics: {
    				available: 8,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010672/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17763",
    						name: "Avengers (1996) #9"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/48369",
    						name: "Journey Into Mystery (1996) #503"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/48370",
    						name: "Journey Into Mystery (1996) #504"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/48373",
    						name: "Journey Into Mystery (1996) #507"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/48374",
    						name: "Journey Into Mystery (1996) #508"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/48375",
    						name: "Journey Into Mystery (1996) #510"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/18681",
    						name: "Thor (1998) #55"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/18684",
    						name: "Thor (1998) #58"
    					}
    				],
    				returned: 8
    			},
    			series: {
    				available: 3,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010672/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3621",
    						name: "Avengers (1996 - 1997)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13569",
    						name: "Journey Into Mystery (1996 - 1998)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/581",
    						name: "Thor (1998 - 2004)"
    					}
    				],
    				returned: 3
    			},
    			stories: {
    				available: 8,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010672/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/37703",
    						name: "Avengers (1996) #9",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/67955",
    						name: "Thor (1998) #55",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/67958",
    						name: "Thor (1998) #58",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/113168",
    						name: "Cover from Journey Into Mystery (1996) #510",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/113169",
    						name: "Cover from Journey Into Mystery (1996) #508",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/113170",
    						name: "Cover from Journey Into Mystery (1996) #507",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/113173",
    						name: "Cover from Journey Into Mystery (1996) #504",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/113174",
    						name: "Cover from Journey Into Mystery (1996) #503",
    						type: "cover"
    					}
    				],
    				returned: 8
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010672/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/136/amora?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1010672/amora?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1010673,
    			name: "Amphibian (Earth-712)",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1010673",
    			comics: {
    				available: 4,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010673/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/3908",
    						name: "Squadron Supreme (2006) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/4038",
    						name: "Squadron Supreme (2006) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5425",
    						name: "Squadron Supreme Vol. 1: The Pre-War Years Premiere (Hardcover)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/18820",
    						name: "Squadron Supreme: New World Order (1999) #1"
    					}
    				],
    				returned: 4
    			},
    			series: {
    				available: 3,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010673/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/944",
    						name: "Squadron Supreme (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1791",
    						name: "Squadron Supreme Vol. 1: The Pre-War Years Premiere (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3685",
    						name: "Squadron Supreme: New World Order (1999)"
    					}
    				],
    				returned: 3
    			},
    			stories: {
    				available: 3,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010673/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5249",
    						name: "1 of 6 - The Pre-War Years",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5251",
    						name: "2 of 6 - The Pre-War Years",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/40338",
    						name: "Cover #40338",
    						type: "cover"
    					}
    				],
    				returned: 3
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010673/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/137/amphibian?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Amphibian_(Earth-712)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1010673/amphibian_earth-712?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1010905,
    			name: "Amun",
    			description: "Amun is a ruthless teenage assassin, employed by the Sisterhood of the Wasp to serve under the mage Vincent after Araña interrupted the ritual to initiate the Wasp's new chosen one.",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1010905",
    			comics: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010905/comics",
    				items: [
    				],
    				returned: 0
    			},
    			series: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010905/series",
    				items: [
    				],
    				returned: 0
    			},
    			stories: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010905/stories",
    				items: [
    				],
    				returned: 0
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010905/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/140/amun?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Amun?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1010905/amun?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1009152,
    			name: "Ancient One",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/b0/4ce59ea2103ac",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1009152",
    			comics: {
    				available: 30,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009152/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/62140",
    						name: "Doctor Strange and the Sorcerers Supreme Vol. 1: Out of Time (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20234",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #7"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20245",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #8"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20172",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #13"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20182",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #22"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20183",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #23"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20194",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #33"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20195",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #34"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20207",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #45"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20209",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #47"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20217",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #54"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20218",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #55"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20250",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #84"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20251",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #85"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20253",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #87"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20254",
    						name: "Doctor Strange, Sorcerer Supreme (1988) #88"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20090",
    						name: "Doctor Strange (1974) #12"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20091",
    						name: "Doctor Strange (1974) #13"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20097",
    						name: "Doctor Strange (1974) #19"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/50874",
    						name: "Guardians of the Galaxy (1990) #19"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 11,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009152/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3740",
    						name: "Doctor Strange (1974 - 1988)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22767",
    						name: "Doctor Strange and the Sorcerers Supreme Vol. 1: Out of Time (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3741",
    						name: "Doctor Strange, Sorcerer Supreme (1988 - 1996)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/21012",
    						name: "Doctor Strange: Masterworks Vol. 7 (2016)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/19019",
    						name: "Guardians of the Galaxy (1990 - 1994)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/19020",
    						name: "Guardians of the Galaxy Annual (1991)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23007",
    						name: "Guidebook to the Marvel Cinematic Universe (2015 - 2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1468",
    						name: "Marvel Masterworks: Doctor Strange Vol. (2005)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2076",
    						name: "Strange Tales (1951 - 1968)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/25557",
    						name: "Untold Tales of Spider-Man: Strange Encounter (1998)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3648",
    						name: "What If? (1989 - 1998)"
    					}
    				],
    				returned: 11
    			},
    			stories: {
    				available: 34,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009152/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/10258",
    						name: "Cover #10258",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/10263",
    						name: "If Kaluu Should Triumph...",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/10292",
    						name: "Umar Walks the Earth!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/10333",
    						name: "This Dream---This Doom!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/39010",
    						name: "What if Wolverine had Become Lord of the Vampires?",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/43011",
    						name: "Doctor Strange (1974) #12",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/43012",
    						name: "Final Curtain!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/43040",
    						name: "Doctor Strange (1974) #13",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/43041",
    						name: "Planet Earth is No More!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/43052",
    						name: "Doctor Strange (1974) #19",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/43053",
    						name: "Lo, the Powers Changeth!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/43211",
    						name: "TBOTV:The Curse of the Darkhold Part V, The Torch is Passed",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/43237",
    						name: "TBOTV:Legends and Lore of the Dark Dimension, Part 2",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/43240",
    						name: "TBOTV:Legends and Lore of the Dark Dimension, Part 3",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/43266",
    						name: "The Alexandrain Quatrain",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/43269",
    						name: "Is There a Doctor Not In The House?",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/43293",
    						name: "Death's Greatest Hits",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/43297",
    						name: "Strange Bedfellows II",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/43314",
    						name: "From Here...To There...To Eternity",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/43317",
    						name: "World Enough, And Time...",
    						type: "interiorStory"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 2,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009152/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/116",
    						name: "Acts of Vengeance!"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/29",
    						name: "Infinity War"
    					}
    				],
    				returned: 2
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/145/ancient_one?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Ancient_One?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1009152/ancient_one?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1016824,
    			name: "Ancient One (Ultimate)",
    			description: "",
    			modified: "2012-07-10T19:15:49-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1016824",
    			comics: {
    				available: 2,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1016824/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15771",
    						name: "Ultimate Marvel Team-Up (2001) #12"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5132",
    						name: "Ultimate Marvel Team-Up Ultimate Collection (Trade Paperback)"
    					}
    				],
    				returned: 2
    			},
    			series: {
    				available: 2,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1016824/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2311",
    						name: "Ultimate Marvel Team-Up (2001 - 2002)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1823",
    						name: "Ultimate Marvel Team-Up Ultimate Collection (2006)"
    					}
    				],
    				returned: 2
    			},
    			stories: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1016824/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/32118",
    						name: "[untitled]",
    						type: "interiorStory"
    					}
    				],
    				returned: 1
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1016824/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/145/ancient_one?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1016824/ancient_one_ultimate?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011684,
    			name: "Angel (Angel Salvadore)",
    			description: "Driven out of home by her abusive step-father, fourteen-year old Angel Salvadore slept in the woods, where her mutant nature manifested itself in the form of a protective cocoon.",
    			modified: "2021-08-19T00:06:46-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011684",
    			comics: {
    				available: 5,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011684/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5451",
    						name: "New X-Men (Hardcover)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14937",
    						name: "New X-Men (2001) #118"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/14960",
    						name: "New X-Men (2001) #141"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/38300",
    						name: "New X-Men Vol. 2: Germ-Free Generation GN-TPB (Graphic Novel)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/2592",
    						name: "NEW X-MEN VOL. 2: IMPERIAL TPB (Trade Paperback)"
    					}
    				],
    				returned: 5
    			},
    			series: {
    				available: 4,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011684/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2281",
    						name: "New X-Men (2001 - 2004)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1807",
    						name: "New X-Men (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13801",
    						name: "New X-Men Vol. 2: Germ-Free Generation GN-TPB (2011 - Present)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1166",
    						name: "NEW X-MEN VOL. 2: IMPERIAL TPB (2005)"
    					}
    				],
    				returned: 4
    			},
    			stories: {
    				available: 3,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011684/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/30476",
    						name: "Germ Free Generation: one of three",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/67329",
    						name: "new x-men 141 cover",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/90480",
    						name: "New X-Men By Grant Morrison Vol. 2 GN-TPB",
    						type: "cover"
    					}
    				],
    				returned: 3
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011684/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/1/angel?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Angel_(Angel_Salvadore)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011684/angel_angel_salvadore?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011396,
    			name: "Angel (Thomas Halloway)",
    			description: "",
    			modified: "2014-03-05T13:14:48-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/d/03/531769834b15f",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011396",
    			comics: {
    				available: 10,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011396/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20636",
    						name: "Incredible Hercules (2008) #114"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/3973",
    						name: "MARVEL MASTERWORKS: GOLDEN AGE MARVEL COMICS VOL. 2 HC (Hardcover)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/16736",
    						name: "Marvel Mystery Comics (1939) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/16758",
    						name: "Marvel Mystery Comics (1939) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/16733",
    						name: "Marvel Mystery Comics (1939) #27"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/26595",
    						name: "The Marvels Project (2009) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/28927",
    						name: "The Marvels Project (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/26599",
    						name: "The Marvels Project (2009) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/26600",
    						name: "The Marvels Project (2009) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/30554",
    						name: "The Marvels Project (2009) #7"
    					}
    				],
    				returned: 10
    			},
    			series: {
    				available: 5,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011396/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3762",
    						name: "Incredible Hercules (2008 - 2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1730",
    						name: "MARVEL MASTERWORKS: GOLDEN AGE MARVEL COMICS VOL. 2 HC (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2981",
    						name: "Marvel Mystery Comics (1939 - 1949)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/8395",
    						name: "The Marvels Project (2009 - 2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/10470",
    						name: "The Marvels Project (2011)"
    					}
    				],
    				returned: 5
    			},
    			stories: {
    				available: 9,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011396/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/34538",
    						name: "Cover #34538",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/34565",
    						name: "Cover #34565",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/34757",
    						name: "[untitled]",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44256",
    						name: "Herc 3 of 4",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/58499",
    						name: "Cover #58499",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/58507",
    						name: "Cover #58507",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/58509",
    						name: "Cover #58509",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/63049",
    						name: "The Marvels Project: Birth Of The Super Heroes TPB",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/69934",
    						name: "Cover #69934",
    						type: "cover"
    					}
    				],
    				returned: 9
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011396/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/1011396/angel_thomas_halloway/featured?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Angel_(Thomas_Halloway)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011396/angel_thomas_halloway?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011338,
    			name: "Angel (Ultimate)",
    			description: "",
    			modified: "2014-03-05T13:15:49-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/4/50/531769ae4399f",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011338",
    			comics: {
    				available: 19,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011338/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15715",
    						name: "Ultimate X-Men (2001) #24"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15716",
    						name: "Ultimate X-Men (2001) #25"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/211",
    						name: "Ultimate X-Men (2001) #40"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/2227",
    						name: "Ultimate X-Men (2001) #61"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/2475",
    						name: "Ultimate X-Men (2001) #63"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/2476",
    						name: "Ultimate X-Men (2001) #64"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/3037",
    						name: "Ultimate X-Men (2001) #65"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/4041",
    						name: "Ultimate X-Men (2001) #69"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/4153",
    						name: "Ultimate X-Men (2001) #70"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/16453",
    						name: "Ultimate X-Men (2001) #86"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20638",
    						name: "Ultimate X-Men (2001) #91"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20967",
    						name: "Ultimate X-Men (2001) #93"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21177",
    						name: "Ultimate X-Men (2001) #94"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21326",
    						name: "Ultimate X-Men (2001) #95"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21507",
    						name: "Ultimate X-Men (2001) #96"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21709",
    						name: "Ultimate X-Men (2001) #97"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/23572",
    						name: "Ultimate X-Men (2001) #100"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15918",
    						name: "Ultimate X-Men Annual (2005) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5057",
    						name: "Ultimate X-Men Vol. 14: Phoenix? (Trade Paperback)"
    					}
    				],
    				returned: 19
    			},
    			series: {
    				available: 3,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011338/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/474",
    						name: "Ultimate X-Men (2001 - 2009)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1055",
    						name: "Ultimate X-Men Annual (2005 - 2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1662",
    						name: "Ultimate X-Men Vol. 14: Phoenix? (2006)"
    					}
    				],
    				returned: 3
    			},
    			stories: {
    				available: 32,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011338/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1454",
    						name: "Ultimate X-Men (2001) #61",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1455",
    						name: "1 of 5 - Escape of Magneto",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1458",
    						name: "Ultimate X-Men (2001) #63",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1459",
    						name: "3 of 5 - Magnetic North",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1460",
    						name: "Ultimate X-Men (2001) #64",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1461",
    						name: "4 of 5 - Magnetic North",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1462",
    						name: "Ultimate X-Men (2001) #65",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1463",
    						name: "5 of 5 - Magnetic North",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1470",
    						name: "Ultimate X-Men (2001) #69",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1471",
    						name: "1 of 3 -",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1472",
    						name: "Ultimate X-Men (2001) #70",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/1473",
    						name: "2 of 3 -",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2041",
    						name: "Ultimate X-Men (2001) #40",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/31888",
    						name: "[UNCANNY X-MEN #416 Preview]",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/31899",
    						name: "[UNCANNY X-MEN #416 Preview]",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/33168",
    						name: "Sentinels 3 of 5",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/36757",
    						name: "Ultimate X-Men Annual (2005) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/36758",
    						name: "Interior #36758",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44259",
    						name: "Ultimate X-Men (2001) #91",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44260",
    						name: "Apocalypse Now 3 of 5",
    						type: "interiorStory"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011338/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/1/angel?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Angel_(Ultimate)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011338/angel_ultimate?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1009153,
    			name: "Angel (Warren Worthington III)",
    			description: "",
    			modified: "2012-05-30T14:06:57-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1009153",
    			comics: {
    				available: 113,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009153/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/60507",
    						name: "All-New Wolverine (2015) #17"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21197",
    						name: "Angel: Revelations (2008) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21345",
    						name: "Angel: Revelations (2008) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21525",
    						name: "Angel: Revelations (2008) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21725",
    						name: "Angel: Revelations (2008) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21953",
    						name: "Angel: Revelations (2008) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/65055",
    						name: "Astonishing X-Men (2017) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/65405",
    						name: "Astonishing X-Men (2017) #7"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/66299",
    						name: "Astonishing X-Men by Charles Soule Vol. 1: Life of X (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8055",
    						name: "Champions (1975) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8066",
    						name: "Champions (1975) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8067",
    						name: "Champions (1975) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8068",
    						name: "Champions (1975) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8069",
    						name: "Champions (1975) #7"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8070",
    						name: "Champions (1975) #8"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8056",
    						name: "Champions (1975) #10"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8058",
    						name: "Champions (1975) #12"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8059",
    						name: "Champions (1975) #13"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8061",
    						name: "Champions (1975) #15"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/8063",
    						name: "Champions (1975) #17"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 44,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009153/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/20682",
    						name: "All-New Wolverine (2015 - 2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/4811",
    						name: "Angel: Revelations (2008)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23262",
    						name: "Astonishing X-Men (2017 - 2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24018",
    						name: "Astonishing X-Men by Charles Soule Vol. 1: Life of X (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2001",
    						name: "Champions (1975 - 1978)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1635",
    						name: "Decimation: Generation M (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3743",
    						name: "Defenders (1972 - 1986)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22406",
    						name: "DEFENDERS EPIC COLLECTION: ASHES, ASHES… TPB (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/30527",
    						name: "Empyre: X-Men (2020)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2121",
    						name: "Fantastic Four (1961 - 1998)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2012",
    						name: "Fantastic Four Annual (1963 - 1994)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2435",
    						name: "Fantastic Four Omnibus Vol. 2 (2007)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/341",
    						name: "FANTASTIC FOUR VISIONARIES: JOHN BYRNE VOL. 2 TPB (2004)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/21726",
    						name: "Gambit Annual (2000)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13853",
    						name: "Gambit: From the Marvel Vault (2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/973",
    						name: "Generation M (2005 - 2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/4819",
    						name: "Genext (2008)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23096",
    						name: "Iceman (2017 - 2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13344",
    						name: "Iceman and Angel (2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2983",
    						name: "Incredible Hulk Annual (1976 - 1994)"
    					}
    				],
    				returned: 20
    			},
    			stories: {
    				available: 119,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009153/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/4058",
    						name: "Cover #4058",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5489",
    						name: "4 of 5 - 5XLS",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5491",
    						name: "5 of 5 - 5XLS - Generation M",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5992",
    						name: "1 of 1 - The Peach Boy",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12765",
    						name: "Fantastic Four (1961) #250",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12766",
    						name: "X-Factor",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/15346",
    						name: "Fantastic Four Annual (1963) #3",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/15347",
    						name: "Bedlam at the Baxter Builing",
    						type: ""
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/15379",
    						name: "Uncanny X-Men (1963) #100",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/15602",
    						name: "Uncanny X-Men (1963) #61",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/20434",
    						name: "Cover #20434",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/20436",
    						name: "Cover #20436",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/20440",
    						name: "From Beyond the Stars...The Stranger Strikes!",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/20442",
    						name: "Cover #20442",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/20446",
    						name: "Cover #20446",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/20450",
    						name: "Cover #20450",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/20456",
    						name: "Cover #20456",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/20458",
    						name: "Cover #20458",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/20460",
    						name: "Cover #20460",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/20462",
    						name: "Cover #20462",
    						type: "cover"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 5,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009153/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/227",
    						name: "Age of Apocalypse"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/318",
    						name: "Dark Reign"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/302",
    						name: "Fear Itself"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/316",
    						name: "X-Men: Battle of the Atom"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/306",
    						name: "X-Men: Schism"
    					}
    				],
    				returned: 5
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/1/angel?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Angel_(Warren_Worthington_III)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1009153/angel_warren_worthington_iii?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1017574,
    			name: "Angela (Aldrif Odinsdottir)",
    			description: "",
    			modified: "2014-11-17T17:45:37-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/7/00/545a82f59dd73",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1017574",
    			comics: {
    				available: 37,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1017574/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/51201",
    						name: "1602 Witch Hunter Angela (2015) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/56505",
    						name: "Angela: Queen of Hel (2015) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/71308",
    						name: "Asgardians of the Galaxy (2018) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/71310",
    						name: "Asgardians of the Galaxy (2018) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/71311",
    						name: "Asgardians of the Galaxy (2018) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/71312",
    						name: "Asgardians of the Galaxy (2018) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/71313",
    						name: "Asgardians of the Galaxy (2018) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/73994",
    						name: "Asgardians of the Galaxy (2018) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/73995",
    						name: "Asgardians of the Galaxy (2018) #7"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/73996",
    						name: "Asgardians of the Galaxy (2018) #8"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/73998",
    						name: "Asgardians of the Galaxy (2018) #10"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/71309",
    						name: "Asgardians Of The Galaxy Vol. 1: The Infinity Armada (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/43301",
    						name: "Guardians of the Galaxy (2013) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/43300",
    						name: "Guardians of the Galaxy (2013) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/43296",
    						name: "Guardians of the Galaxy (2013) #10"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/43295",
    						name: "Guardians of the Galaxy (2013) #11"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/60980",
    						name: "Guardians of the Galaxy (2015) #18"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/60676",
    						name: "GUARDIANS OF THE GALAXY VOL. 4 HC (Hardcover)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/60168",
    						name: "Guardians of The Galaxy: New Guard Vol. 3 - Civil War II (Hardcover)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/60169",
    						name: "Guardians of the Galaxy: New Guard Vol. 3 - Civil War II (Trade Paperback)"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 15,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1017574/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/19244",
    						name: "1602 Witch Hunter Angela (2015)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/20696",
    						name: "Angela: Queen of Hel (2015 - 2016)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/25996",
    						name: "Asgardians of the Galaxy (2018 - Present)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/25997",
    						name: "Asgardians Of The Galaxy Vol. 1: The Infinity Armada (2019)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/16410",
    						name: "Guardians of the Galaxy (2013 - 2015)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/20465",
    						name: "Guardians of the Galaxy (2015 - 2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22420",
    						name: "GUARDIANS OF THE GALAXY VOL. 4 HC (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22117",
    						name: "Guardians of The Galaxy: New Guard Vol. 3 - Civil War II (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22118",
    						name: "Guardians of the Galaxy: New Guard Vol. 3 - Civil War II (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/32375",
    						name: "Marvel's Voices: Pride (2021)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22121",
    						name: "Mighty Thor Vol. 3: The Asgard/Shi'ar War (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22120",
    						name: "Mighty Thor Vol. 3: The Asgard/Shi'ar War (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/18681",
    						name: "Original Sin (2014)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/27891",
    						name: "Strikeforce (2019 - 2020)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24308",
    						name: "Thor (2018 - 2019)"
    					}
    				],
    				returned: 15
    			},
    			stories: {
    				available: 37,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1017574/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/96952",
    						name: "Cover #96952",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/96954",
    						name: "Guardians of the Galaxy #10",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/96962",
    						name: "Cover #96962",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/96964",
    						name: "Cover #96964",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/111122",
    						name: "cover from new series (2015) #6",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/113693",
    						name: "ORIGINAL SIN 5.1 ",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/113708",
    						name: "ORIGINAL SIN 5.2 (SIN, WITH DIGITAL CODE)",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/113729",
    						name: "ORIGINAL SIN 5.3 (SIN, WITH DIGITAL CODE)",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/113773",
    						name: "ORIGINAL SIN 5.4 (SIN, WITH DIGITAL CODE)",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/113810",
    						name: "ORIGINAL SIN 5.5 (SIN, WITH DIGITAL CODE)",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/113979",
    						name: "cover from 1602 Witch Hunter Angela (2015) #4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/121290",
    						name: "Original Sin (2014) #8 Cover",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/123865",
    						name: "cover from Angela: Queen of Hel (2015) #5",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/130833",
    						name: "cover from Guardians of the Galaxy: New Guard (2017)",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/130835",
    						name: "cover from Guardians of the Galaxy: New Guard (2017)",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/130839",
    						name: "cover from Mighty Thor (2017)",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/130841",
    						name: "cover from Mighty Thor (2017)",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/131821",
    						name: "cover from Guardians of the Galaxy: New Guard (2017)",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/132413",
    						name: "cover from Guardians of the Galaxy (2015) #18",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/154813",
    						name: "cover from Thor (2018) #8",
    						type: "cover"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1017574/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/319",
    						name: "Original Sin"
    					}
    				],
    				returned: 1
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/comics/characters/1017574/angela_aldrif_odinsdottir?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1017574/angela_aldrif_odinsdottir?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1010674,
    			name: "Anita Blake",
    			description: "",
    			modified: "2004-04-14T00:00:00-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/2/a0/4c0038fa14452",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1010674",
    			comics: {
    				available: 9,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010674/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5912",
    						name: "Anita Blake, Vampire Hunter: Guilty Pleasures (2006) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5745",
    						name: "Anita Blake, Vampire Hunter: Guilty Pleasures (2006) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/6143",
    						name: "Anita Blake, Vampire Hunter: Guilty Pleasures (2006) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/16548",
    						name: "Anita Blake, Vampire Hunter: Guilty Pleasures (2006) #8"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20681",
    						name: "Anita Blake, Vampire Hunter: Guilty Pleasures (2006) #8 (Booth Variant)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20880",
    						name: "Anita Blake, Vampire Hunter: Guilty Pleasures (2006) #9"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5907",
    						name: "Anita Blake, Vampire Hunter: Guilty Pleasures (2006) #10"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21227",
    						name: "Anita Blake, Vampire Hunter: Guilty Pleasures (2006) #11"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21368",
    						name: "Anita Blake, Vampire Hunter: Guilty Pleasures (2006) #12"
    					}
    				],
    				returned: 9
    			},
    			series: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010674/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1152",
    						name: "Anita Blake, Vampire Hunter: Guilty Pleasures (2006 - 2008)"
    					}
    				],
    				returned: 1
    			},
    			stories: {
    				available: 49,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010674/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/6285",
    						name: "Cover #6285",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/7932",
    						name: "Cover #7932",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/33070",
    						name: "2XLS - The First Death 2 of 2",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/33374",
    						name: "12XLS 8 of 12",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44350",
    						name: "12XLS 8 of 12",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44711",
    						name: "12XLS 9 of 12",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/46887",
    						name: "12XLS 11 of 12",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47188",
    						name: "12XLS 12 of 12",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/49008",
    						name: "15XLS 1 of 15",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/50014",
    						name: "15XLS 2 of 15",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/51012",
    						name: "15XLS 3 of 15",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/51361",
    						name: "5XLS 4 of 5",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/52361",
    						name: "5XLS 5 of 5",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/53269",
    						name: "5XLS 1 of 5",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/53270",
    						name: "5XLS 1 of 5",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/53271",
    						name: "5XLS 1 of 5",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/53678",
    						name: "5XLS 2 of 5",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/53679",
    						name: "5XLS 2 of 5",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/53989",
    						name: "Cover #53989",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/53991",
    						name: "Cover #53991",
    						type: "cover"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010674/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/3428/anita_blake?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Blake,_Anita_(Anita_Blake_Universe)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1010674/anita_blake?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1009346,
    			name: "Anne Marie Hoag",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1009346",
    			comics: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009346/comics",
    				items: [
    				],
    				returned: 0
    			},
    			series: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009346/series",
    				items: [
    				],
    				returned: 0
    			},
    			stories: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009346/stories",
    				items: [
    				],
    				returned: 0
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009346/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/2714/anne_marie_hoag?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1009346/anne_marie_hoag?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1009154,
    			name: "Annihilus",
    			description: "",
    			modified: "2013-11-20T17:06:36-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/5/f0/528d31f20a2f6",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1009154",
    			comics: {
    				available: 65,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009154/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/55364",
    						name: "All-New, All-Different Avengers (2015) #11"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/4788",
    						name: "Annihilation (2006) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5230",
    						name: "Annihilation (2006) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5529",
    						name: "Annihilation (2006) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5795",
    						name: "Annihilation (2006) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/4473",
    						name: "Annihilation: Nova (2006) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/4218",
    						name: "Annihilation: Silver Surfer (2006) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/4315",
    						name: "Annihilation: Silver Surfer (2006) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/66602",
    						name: "Annihilation: The Complete Collection Vol. 1 (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/4822",
    						name: "Annihilation: The Nova Corps (2006) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/2055",
    						name: "Essential Fantastic Four Vol. 4 (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15537",
    						name: "Fantastic Four (1998) #19"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15561",
    						name: "Fantastic Four (1998) #40"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15563",
    						name: "Fantastic Four (1998) #42"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15564",
    						name: "Fantastic Four (1998) #43"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/15565",
    						name: "Fantastic Four (1998) #44"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12982",
    						name: "Fantastic Four (1961) #179"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13063",
    						name: "Fantastic Four (1961) #251"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13064",
    						name: "Fantastic Four (1961) #252"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/13065",
    						name: "Fantastic Four (1961) #253"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 30,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009154/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/20443",
    						name: "All-New, All-Different Avengers (2015 - 2016)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/454",
    						name: "Amazing Spider-Man (1999 - 2013)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3613",
    						name: "Annihilation (2006 - 2007)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1081",
    						name: "Annihilation: Nova (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1078",
    						name: "Annihilation: Silver Surfer (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24256",
    						name: "Annihilation: The Complete Collection Vol. 1 (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1115",
    						name: "Annihilation: The Nova Corps (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1263",
    						name: "Essential Fantastic Four Vol. 4 (2005)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2123",
    						name: "Fantastic Four (1996 - 1997)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/421",
    						name: "Fantastic Four (1998 - 2012)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2121",
    						name: "Fantastic Four (1961 - 1998)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2012",
    						name: "Fantastic Four Annual (1963 - 1994)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1424",
    						name: "Fantastic Four Visionaries: John Byrne Vol. 3 (2004)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13577",
    						name: "Iron Man (1996 - 1998)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/991",
    						name: "Last Planet Standing (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3719",
    						name: "Marvel Fanfare (1982 - 1992)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/49",
    						name: "Marvel Mangaverse Vol. I (2002)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2275",
    						name: "Marvel Mangaverse: Fantastic Four (2002)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1437",
    						name: "Marvel Masterworks: The Fantastic Four Vol. 8 (2005)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2059",
    						name: "Paradise X (2002 - 2003)"
    					}
    				],
    				returned: 20
    			},
    			stories: {
    				available: 82,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009154/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5594",
    						name: "3 of 5 XLS",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5596",
    						name: "4 of 5 XLS",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5598",
    						name: "5 of 5 XLS",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5927",
    						name: "Annihilation: Silver Surfer (2006) #2",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5929",
    						name: "Annihilation: Silver Surfer (2006) #3",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5960",
    						name: "3 of 6 - Annihilation",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5962",
    						name: "4 of 6 - Annihilation",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5966",
    						name: "6 of 6 - End of Story",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/6149",
    						name: "Cover #6149",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12584",
    						name: "Fantastic Four (1961) #179",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12585",
    						name: "A Robinson Crusoe in the Negative Zone!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12768",
    						name: "Fantastic Four (1961) #251",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12769",
    						name: "Into the Negative Zone",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12770",
    						name: "Fantastic Four (1961) #252",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12771",
    						name: "Cityscape",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12772",
    						name: "Fantastic Four (1961) #253",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12773",
    						name: "Quest",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12774",
    						name: "Fantastic Four (1961) #254",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12775",
    						name: "The Minds of Mantracora",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12776",
    						name: "Fantastic Four (1961) #255",
    						type: "cover"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009154/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/229",
    						name: "Annihilation"
    					}
    				],
    				returned: 1
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/154/annihilus?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Annihilus?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1009154/annihilus?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011301,
    			name: "Anole",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/9/20/4c002e635ddd9",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011301",
    			comics: {
    				available: 5,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011301/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/73064",
    						name: "Age Of X-Man: Nextgen (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24173",
    						name: "Runaways (2008) #10"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/26970",
    						name: "Uncanny X-Men (1963) #517"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/79949",
    						name: "X-Men (2019) #11"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/79950",
    						name: "X-Men (2019) #12"
    					}
    				],
    				returned: 5
    			},
    			series: {
    				available: 4,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011301/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/26372",
    						name: "Age Of X-Man: Nextgen (2019)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/5338",
    						name: "Runaways (2008 - 2009)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2258",
    						name: "Uncanny X-Men (1963 - 2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/27567",
    						name: "X-Men (2019 - Present)"
    					}
    				],
    				returned: 4
    			},
    			stories: {
    				available: 5,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011301/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/53571",
    						name: "Interior #53571",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/59253",
    						name: "Interior #59253",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/162802",
    						name: "cover from AGE OF X-MAN: TBD B TPB (2019) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/176967",
    						name: "cover from X-Men (2019) #11",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/176969",
    						name: "cover from X-Men (2019) #12",
    						type: "cover"
    					}
    				],
    				returned: 5
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011301/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/155/anole?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Anole?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011301/anole?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1010802,
    			name: "Ant-Man (Eric O'Grady)",
    			description: "",
    			modified: "2014-03-05T13:20:04-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/9/c0/53176aa9df48d",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1010802",
    			comics: {
    				available: 42,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010802/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/36765",
    						name: "Ant-Man & the Wasp (2010) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/36764",
    						name: "Ant-Man & the Wasp (2010) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/36763",
    						name: "Ant-Man & the Wasp (2010) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/37655",
    						name: "Ant-Man & Wasp: Small World (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21366",
    						name: "Avengers: The Initiative (2007) #14"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24571",
    						name: "Avengers: The Initiative (2007) #14 (SPOTLIGHT VARIANT)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21975",
    						name: "Avengers: The Initiative (2007) #17"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/22299",
    						name: "Avengers: The Initiative (2007) #18"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/22300",
    						name: "Avengers: The Initiative (2007) #18 (ZOMBIE VARIANT)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/22506",
    						name: "Avengers: The Initiative (2007) #19"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/22912",
    						name: "Avengers: The Initiative (2007) #20"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/39955",
    						name: "Fear Itself: The Fearless (2011) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/34543",
    						name: "I Am an Avenger (2010) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5199",
    						name: "Irredeemable Ant-Man (2006) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5360",
    						name: "Irredeemable Ant-Man (2006) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5628",
    						name: "Irredeemable Ant-Man (2006) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5775",
    						name: "Irredeemable Ant-Man (2006) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5938",
    						name: "Irredeemable Ant-Man (2006) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/6076",
    						name: "Irredeemable Ant-Man (2006) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/6210",
    						name: "Irredeemable Ant-Man (2006) #7"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 13,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010802/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13082",
    						name: "Ant-Man & the Wasp (2010 - 2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13540",
    						name: "Ant-Man & Wasp: Small World (2010 - Present)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1945",
    						name: "Avengers: The Initiative (2007 - 2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/14804",
    						name: "Fear Itself: The Fearless (2011 - 2012)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/11872",
    						name: "I Am an Avenger (2010 - 2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/977",
    						name: "Irredeemable Ant-Man (2006 - 2007)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2423",
    						name: "Irredeemable Ant-Man Vol. 1: Low-Life (2007)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/5202",
    						name: "Marvel Adventures Super Heroes (2008 - 2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13602",
    						name: "Onslaught Unleashed (2010 - 2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/18681",
    						name: "Original Sin (2014)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/9799",
    						name: "Secret Avengers (2010 - 2012)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/18527",
    						name: "Thunderbolts (2006 - 2012)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/14016",
    						name: "X-Men: God Loves, Man Kills (2011 - 2019)"
    					}
    				],
    				returned: 13
    			},
    			stories: {
    				available: 41,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010802/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5496",
    						name: "Irredeemable Ant-Man (2006) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5498",
    						name: "Irredeemable Ant-Man (2006) #2",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5500",
    						name: "Irredeemable Ant-Man (2006) #3",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5502",
    						name: "Irredeemable Ant-Man (2006) #4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/7767",
    						name: "Irredeemable Ant-Man (2006) #5",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/7769",
    						name: "Irredeemable Ant-Man (2006) #6",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/8237",
    						name: "Irredeemable Ant-Man (2006) #7",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/8239",
    						name: "6 of 6 - Story A",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/8641",
    						name: "Irredeemable Ant-Man (2006) #8",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/32343",
    						name: "Irredeemable Ant-Man (2006) #9",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/32573",
    						name: "Irredeemable Ant-Man (2006) #10",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/32953",
    						name: "Irredeemable Ant-Man (2006) #11",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/33255",
    						name: "Irredeemable Ant-Man (2006) #12",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/47185",
    						name: "Avengers: The Initiative (2007) #14 - Int",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/48362",
    						name: "Avengers: The Initiative (2007) #17 - Int",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/49104",
    						name: "Avengers: The Initiative (2007) #18 - Int",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/49106",
    						name: "Avengers: The Initiative (2007) #18, Zombie Variant - Int",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/49889",
    						name: "Avengers: The Initiative (2007) #19 - Int",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/50870",
    						name: "Avengers: The Initiative (2007) #20 - Int",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/50955",
    						name: "24XLS 6 of 24",
    						type: "cover"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 7,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010802/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/318",
    						name: "Dark Reign"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/302",
    						name: "Fear Itself"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/319",
    						name: "Original Sin"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/269",
    						name: "Secret Invasion"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/309",
    						name: "Shattered Heroes"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/273",
    						name: "Siege"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/277",
    						name: "World War Hulk"
    					}
    				],
    				returned: 7
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/comics/characters/1010802/ant-man_eric_ogrady?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Ant-Man_(Eric_O%27Grady)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1010802/ant-man_eric_ogrady?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1009155,
    			name: "Ant-Man (Hank Pym)",
    			description: "",
    			modified: "2021-08-05T15:11:25-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1009155",
    			comics: {
    				available: 38,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009155/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/47072",
    						name: "Age of Ultron (2013) #10"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/67309",
    						name: "Ant-Man and the Wasp Adventures (Digest)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/62399",
    						name: "Ant-Man: Larger than Life (2016) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/70285",
    						name: "Ant-Man/Giant-Man: Growing Pains (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/41530",
    						name: "Ant-Man: Astonishing Origins (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/41514",
    						name: "Ant-Man: Season One (2011) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/7021",
    						name: "Avengers (1963) #161"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/7022",
    						name: "Avengers (1963) #162"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20628",
    						name: "Avengers Annual (2001) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/5844",
    						name: "Avengers Assemble Vol. 4 (Hardcover)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/31",
    						name: "Avengers: Earth's Mightiest Heroes (2004) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/65326",
    						name: "Avengers: Tales to Astonish (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/31151",
    						name: "Avengers: The Origin (2010) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/31153",
    						name: "Avengers: The Origin (2010) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/31155",
    						name: "Avengers: The Origin (2010) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/31156",
    						name: "Avengers: The Origin (2010) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/31158",
    						name: "Avengers: The Origin (2010) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/68004",
    						name: "Color Your Own Ant-Man and the Wasp (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/12961",
    						name: "Fantastic Four (1961) #16"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/65569",
    						name: "Incredible Hulk Epic Collection: Fall of the Pantheon (Trade Paperback)"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 27,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009155/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/17318",
    						name: "Age of Ultron (2013)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24323",
    						name: "Ant-Man and the Wasp Adventures (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/25671",
    						name: "Ant-Man/Giant-Man: Growing Pains (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24418",
    						name: "Ant-Man: Astonishing Origins (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22917",
    						name: "Ant-Man: Larger than Life (2016)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/15468",
    						name: "Ant-Man: Season One (2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1991",
    						name: "Avengers (1963 - 1996)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/26448",
    						name: "Avengers Annual (2001)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1816",
    						name: "Avengers Assemble Vol. 4 (2007)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/724",
    						name: "Avengers: Earth's Mightiest Heroes (2004 - 2005)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23777",
    						name: "Avengers: Tales to Astonish (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/9020",
    						name: "Avengers: The Origin (2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24551",
    						name: "Color Your Own Ant-Man and the Wasp (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2121",
    						name: "Fantastic Four (1961 - 1998)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23843",
    						name: "Incredible Hulk Epic Collection: Fall of the Pantheon (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/5202",
    						name: "Marvel Adventures Super Heroes (2008 - 2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/9718",
    						name: "Marvel Adventures Super Heroes (2010 - 2012)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/6676",
    						name: "Marvel Feature (1971 - 1973)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/25011",
    						name: "Marvel Masterworks: Ant-Man/Giant-Man Vol. 3 (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23692",
    						name: "Marvel Super Heroes: Larger Than Life (2017)"
    					}
    				],
    				returned: 20
    			},
    			stories: {
    				available: 41,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009155/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/3023",
    						name: "Avengers: Earth's Mightiest Heroes (2004) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/3024",
    						name: "1 of 8 - 8XLS",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/12539",
    						name: "FANTASTIC FOUR (1961) #16",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/14580",
    						name: "AVENGERS (1963) #161",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/14582",
    						name: "AVENGERS (1963) #162",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44881",
    						name: "Avengers Annual (2001) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44882",
    						name: "Interior #44882",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/51709",
    						name: "Cover #51709",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/51722",
    						name: "Cover #51722",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/51724",
    						name: "Cover #51724",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/51726",
    						name: "Cover #51726",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/51728",
    						name: "Cover #51728",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/51730",
    						name: "Cover #51730",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/51732",
    						name: "Cover #51732",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/53199",
    						name: "24XLS 10 of 24",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/57365",
    						name: "New Avengers (2004) #60",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/71045",
    						name: "Avengers: The Origin (2010) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/71049",
    						name: "Avengers: The Origin (2010) #3",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/71052",
    						name: "Avengers: The Origin (2010) #4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/71054",
    						name: "Interior #71054",
    						type: "interiorStory"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009155/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/314",
    						name: "Age of Ultron"
    					}
    				],
    				returned: 1
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/2/ant-man?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Yellowjacket_(Henry_Pym)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1009155/ant-man_hank_pym?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1010801,
    			name: "Ant-Man (Scott Lang)",
    			description: "",
    			modified: "2017-01-31T11:03:40-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/e/20/52696868356a0",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1010801",
    			comics: {
    				available: 115,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010801/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/60151",
    						name: "A YEAR OF MARVELS TPB (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17743",
    						name: "A-Next (1998) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17744",
    						name: "A-Next (1998) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17745",
    						name: "A-Next (1998) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17746",
    						name: "A-Next (1998) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17747",
    						name: "A-Next (1998) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17748",
    						name: "A-Next (1998) #7"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17749",
    						name: "A-Next (1998) #8"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17750",
    						name: "A-Next (1998) #9"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17740",
    						name: "A-Next (1998) #10"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17741",
    						name: "A-Next (1998) #11"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17742",
    						name: "A-Next (1998) #12"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/37256",
    						name: "Alias (2001) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/37267",
    						name: "Alias (2001) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/37277",
    						name: "Alias (2001) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/37255",
    						name: "Alias Omnibus (Hardcover)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/16899",
    						name: "Amazing Spider-Man Annual (1964) #24"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/55334",
    						name: "The Astonishing Ant-Man Vol. 3: The Trial of Ant-Man (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/55329",
    						name: "The Astonishing Ant-Man (2015) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/81176",
    						name: "Ant-Man (2020) #1"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 49,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010801/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22102",
    						name: "A YEAR OF MARVELS TPB (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3620",
    						name: "A-Next (1998 - 1999)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/672",
    						name: "Alias (2001 - 2003)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/13383",
    						name: "Alias Omnibus (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23058",
    						name: "All-New Guardians of the Galaxy (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2984",
    						name: "Amazing Spider-Man Annual (1964 - 2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/29032",
    						name: "Ant-Man (2020)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24290",
    						name: "Ant-Man & the Wasp (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24415",
    						name: "Ant-Man & the Wasp: Living Legends (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24323",
    						name: "Ant-Man and the Wasp Adventures (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24413",
    						name: "Ant-Man and the Wasp: Lost And Found (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24418",
    						name: "Ant-Man: Astonishing Origins (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/9085",
    						name: "Avengers (2010 - 2012)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/354",
    						name: "Avengers (1998 - 2004)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1991",
    						name: "Avengers (1963 - 1996)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24446",
    						name: "Avengers By Jonathan Hickman Omnibus Vol. 2 (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3971",
    						name: "Avengers Fairy Tales (2008)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/20711",
    						name: "Captain America: Sam Wilson (2015 - 2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/24551",
    						name: "Color Your Own Ant-Man and the Wasp (2018)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/23913",
    						name: "Deadpool Classic Vol. 21: DvX (2018)"
    					}
    				],
    				returned: 20
    			},
    			stories: {
    				available: 137,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010801/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/2326",
    						name: "Avengers (1998) #74",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13209",
    						name: "Fantastic Four (1961) #384",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13210",
    						name: "My Enemy, My Son!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13215",
    						name: "Fantastic Four (1961) #385",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13216",
    						name: "Into the Deep!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13222",
    						name: "Fantastic Four (1961) #386",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13223",
    						name: "And Then Came Despair",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13229",
    						name: "Fantastic Four (1961) #387",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13231",
    						name: "Nobody Gets Out Alive!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13236",
    						name: "Fantastic Four (1961) #388",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13237",
    						name: "Deadly Is the Dark Raider",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13243",
    						name: "Fantastic Four (1961) #389",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13244",
    						name: "Behold a Fatal Future!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13251",
    						name: "Fantastic Four (1961) #390",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13252",
    						name: "\"Past Deceptions and Future Lies!\"",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13258",
    						name: "Fantastic Four (1961) #391",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13259",
    						name: "If Death Be Our Destiny--!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13264",
    						name: "Fantastic Four (1961) #392",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13265",
    						name: "The Final Gantlet!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/13270",
    						name: "Fantastic Four (1961) #393",
    						type: "cover"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 2,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1010801/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/302",
    						name: "Fear Itself"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/336",
    						name: "Secret Empire"
    					}
    				],
    				returned: 2
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/comics/characters/1010801/ant-man_scott_lang?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Ant-Man_(Scott_Lang)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1010801/ant-man_scott_lang?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011208,
    			name: "Anthem",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011208",
    			comics: {
    				available: 11,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011208/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/16005",
    						name: "The Order (2007) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/16188",
    						name: "The Order (2007) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/16594",
    						name: "The Order (2007) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/16595",
    						name: "The Order (2007) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17283",
    						name: "The Order (2007) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17416",
    						name: "The Order (2007) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/17651",
    						name: "The Order (2007) #7"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20695",
    						name: "The Order (2007) #8"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20889",
    						name: "The Order (2007) #9"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/21020",
    						name: "The Order (2007) #10"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20734",
    						name: "The Order Vol. 1: The Next Right Thing (Trade Paperback)"
    					}
    				],
    				returned: 11
    			},
    			series: {
    				available: 2,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011208/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2537",
    						name: "The Order (2007 - 2008)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/3877",
    						name: "The Order Vol. 1: The Next Right Thing (2008)"
    					}
    				],
    				returned: 2
    			},
    			stories: {
    				available: 20,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011208/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/32683",
    						name: "The Order (2007) #1",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/32684",
    						name: "12XLS 1 of 12; THE INITIATIVE BANNER",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/33066",
    						name: "The Order (2007) #2",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/33067",
    						name: "12XLS 2 of 12; THE INITIATIVE BANNER",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/33467",
    						name: "The Order (2007) #3",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/33468",
    						name: "THE INITIATIVE BANNER",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/33469",
    						name: "The Order (2007) #4",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/33470",
    						name: "THE INITIATIVE BANNER",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/36218",
    						name: "The Order (2007) #5",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/36219",
    						name: "Interior #36219",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/36517",
    						name: "The Order (2007) #6",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/36518",
    						name: "Interior #36518",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/36947",
    						name: "The Order (2007) #7",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/36948",
    						name: "Interior #36948",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44384",
    						name: "The Order (2007) #8",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44385",
    						name: "1 of 5",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44730",
    						name: "The Order (2007) #9",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44731",
    						name: "2 of 5",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/45741",
    						name: "The Order (2007) #10",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/45742",
    						name: "3 of 5",
    						type: "interiorStory"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011208/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/255",
    						name: "Initiative"
    					}
    				],
    				returned: 1
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/158/anthem?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Anthem?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011208/anthem?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1009156,
    			name: "Apocalypse",
    			description: "",
    			modified: "2014-05-28T12:41:41-0400",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/f/e0/526166076a1d0",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1009156",
    			comics: {
    				available: 123,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009156/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/72959",
    						name: "Age of X-Man: Apocalypse & the X-Tracts (2019) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/72963",
    						name: "Age of X-Man: Apocalypse & the X-Tracts (2019) #5"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/29205",
    						name: "Avengers (2010) #2"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/29206",
    						name: "Avengers (2010) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/34142",
    						name: "Avengers (2010) #3 (ROMITA JR. VARIANT)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/7459",
    						name: "Cable (1993) #8"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24171",
    						name: "Cable (2008) #14"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24172",
    						name: "Cable (2008) #14 (MW, 50/50 Variant)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24631",
    						name: "Cable (2008) #15"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/24632",
    						name: "Cable (2008) #15 (MW, 50/50 Variant)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/7410",
    						name: "Cable (1993) #35"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/7444",
    						name: "Cable (1993) #66"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/7454",
    						name: "Cable (1993) #75"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/39445",
    						name: "Essential X-Factor Vol. 2 (All-New Edition) (Trade Paperback)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/76729",
    						name: "Excalibur (2019) #1"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/76731",
    						name: "Excalibur (2019) #3"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/76732",
    						name: "Excalibur (2019) #4"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/76734",
    						name: "Excalibur (2019) #6"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/78389",
    						name: "Excalibur (2019) #8"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/84380",
    						name: "Excalibur (2019) #12"
    					}
    				],
    				returned: 20
    			},
    			series: {
    				available: 56,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009156/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/26335",
    						name: "Age of X-Man: Apocalypse & the X-Tracts (2019)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/9085",
    						name: "Avengers (2010 - 2012)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/4002",
    						name: "Cable (2008 - 2010)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1995",
    						name: "Cable (1993 - 2002)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/14400",
    						name: "Essential X-Factor Vol. 2 (All-New Edition) (2011 - Present)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/27547",
    						name: "Excalibur (2019 - Present)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/20418",
    						name: "Extraordinary X-Men Vol. 3: Kingdoms Fall (2017)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22173",
    						name: "Further Adventures of Cyclops & Phoenix (1996)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2021",
    						name: "Incredible Hulk (1962 - 1999)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/8138",
    						name: "Mystic Comics 70th Anniversary Special (2009)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/31809",
    						name: "New Eternals: Apocalypse Now (2000)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/787",
    						name: "Official Handbook of the Marvel Universe (2004)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2057",
    						name: "Onslaught: Marvel Universe (1996)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/22174",
    						name: "Rise of Apocalypse (1996 - 1997)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/17927",
    						name: "Stryfe's Strike File (1993)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/16414",
    						name: "Uncanny Avengers (2012 - 2014)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/9976",
    						name: "Uncanny X-Force (2010 - 2012)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2258",
    						name: "Uncanny X-Men (1963 - 2011)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/1075",
    						name: "What If? X-Men Age of Apocalypse (2006)"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/2425",
    						name: "WHAT IF?: EVENT HORIZON TPB (2007)"
    					}
    				],
    				returned: 20
    			},
    			stories: {
    				available: 124,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009156/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/477",
    						name: "Cover #477",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/664",
    						name: "X-MEN (2004) #183",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/666",
    						name: "X-MEN (2004) #184",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/668",
    						name: "X-MEN (2004) #185",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/3425",
    						name: "Cover #3425",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/3588",
    						name: "Cover #3588",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/3592",
    						name: "Cover #3592",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/3866",
    						name: "Cover #3866",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/4153",
    						name: "Cover #4153",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/4223",
    						name: "Cover #4223",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/4430",
    						name: "Cover #4430",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/4513",
    						name: "Cover #4513",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/4612",
    						name: "Cover #4612",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/4614",
    						name: "Cover #4614",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/5919",
    						name: "Cover #5919",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/19075",
    						name: "...Meet War!",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/22203",
    						name: "Whose Death Is It, Anyway?",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/22207",
    						name: "Die, Mutants, Die!",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/22210",
    						name: "The Horsemen of Apocalypse",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/22221",
    						name: "You Say You Want Some Evolution?",
    						type: "interiorStory"
    					}
    				],
    				returned: 20
    			},
    			events: {
    				available: 6,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1009156/events",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/116",
    						name: "Acts of Vengeance!"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/227",
    						name: "Age of Apocalypse"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/246",
    						name: "Evolutionary War"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/248",
    						name: "Fall of the Mutants"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/298",
    						name: "Messiah War"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/events/154",
    						name: "Onslaught"
    					}
    				],
    				returned: 6
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/comics/characters/1009156/apocalypse?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Apocalypse_(En_Sabah_Nur)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1009156/apocalypse?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		},
    		{
    			id: 1011253,
    			name: "Apocalypse (Ultimate)",
    			description: "",
    			modified: "1969-12-31T19:00:00-0500",
    			thumbnail: {
    				path: "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available",
    				extension: "jpg"
    			},
    			resourceURI: "http://gateway.marvel.com/v1/public/characters/1011253",
    			comics: {
    				available: 3,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011253/comics",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20638",
    						name: "Ultimate X-Men (2001) #91"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20830",
    						name: "Ultimate X-Men (2001) #92"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/comics/20967",
    						name: "Ultimate X-Men (2001) #93"
    					}
    				],
    				returned: 3
    			},
    			series: {
    				available: 1,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011253/series",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/series/474",
    						name: "Ultimate X-Men (2001 - 2009)"
    					}
    				],
    				returned: 1
    			},
    			stories: {
    				available: 6,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011253/stories",
    				items: [
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44259",
    						name: "Ultimate X-Men (2001) #91",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44260",
    						name: "Apocalypse Now 3 of 5",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44611",
    						name: "Ultimate X-Men (2001) #92",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/44612",
    						name: "Apocalypse Now 4 of 5",
    						type: "interiorStory"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/45246",
    						name: "Ultimate X-Men (2001) #93",
    						type: "cover"
    					},
    					{
    						resourceURI: "http://gateway.marvel.com/v1/public/stories/45247",
    						name: "4 of 4 Apocalypse Now",
    						type: "interiorStory"
    					}
    				],
    				returned: 6
    			},
    			events: {
    				available: 0,
    				collectionURI: "http://gateway.marvel.com/v1/public/characters/1011253/events",
    				items: [
    				],
    				returned: 0
    			},
    			urls: [
    				{
    					type: "detail",
    					url: "http://marvel.com/characters/166/apocalypse?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "wiki",
    					url: "http://marvel.com/universe/Apocalypse%20(Ultimate)?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				},
    				{
    					type: "comiclink",
    					url: "http://marvel.com/comics/characters/1011253/apocalypse_ultimate?utm_campaign=apiRef&utm_source=930e43a8496c8cc563f2d22c2b2c764d"
    				}
    			]
    		}
    	]
    };
    var page3 = {
    	code: code,
    	status: status,
    	copyright: copyright,
    	attributionText: attributionText,
    	attributionHTML: attributionHTML,
    	etag: etag,
    	data: data
    };

    const handlers = [
        rest.get('https://gateway.marvel.com/v1/public/characters', (req, res, ctx) => {
            const query = req.url.searchParams;
            query.get("apikey");
            const offset = query.get('offset');
            query.get('nameStartsWith');
            let json = page1;
            switch (offset) {
                case '20':
                    json = page2;
                    break;
                case '40':
                    json = page3;
                    break;
                default:
                    json = page1;
                    break;
            }
            return res(ctx.status(200), ctx.delay(500), ctx.json(json));
        }),
    ];

    setupWorker(...handlers);

    // worker.start()
    const app = new App({
        target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
