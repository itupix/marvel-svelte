
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

    // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
    // at the end of hydration without touching the remaining nodes.
    let is_hydrating = false;
    function start_hydrating() {
        is_hydrating = true;
    }
    function end_hydrating() {
        is_hydrating = false;
    }
    function upper_bound(low, high, key, value) {
        // Return first index of value larger than input value in the range [low, high)
        while (low < high) {
            const mid = low + ((high - low) >> 1);
            if (key(mid) <= value) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }
        return low;
    }
    function init_hydrate(target) {
        if (target.hydrate_init)
            return;
        target.hydrate_init = true;
        // We know that all children have claim_order values since the unclaimed have been detached
        const children = target.childNodes;
        /*
        * Reorder claimed children optimally.
        * We can reorder claimed children optimally by finding the longest subsequence of
        * nodes that are already claimed in order and only moving the rest. The longest
        * subsequence subsequence of nodes that are claimed in order can be found by
        * computing the longest increasing subsequence of .claim_order values.
        *
        * This algorithm is optimal in generating the least amount of reorder operations
        * possible.
        *
        * Proof:
        * We know that, given a set of reordering operations, the nodes that do not move
        * always form an increasing subsequence, since they do not move among each other
        * meaning that they must be already ordered among each other. Thus, the maximal
        * set of nodes that do not move form a longest increasing subsequence.
        */
        // Compute longest increasing subsequence
        // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
        const m = new Int32Array(children.length + 1);
        // Predecessor indices + 1
        const p = new Int32Array(children.length);
        m[0] = -1;
        let longest = 0;
        for (let i = 0; i < children.length; i++) {
            const current = children[i].claim_order;
            // Find the largest subsequence length such that it ends in a value less than our current value
            // upper_bound returns first greater value, so we subtract one
            const seqLen = upper_bound(1, longest + 1, idx => children[m[idx]].claim_order, current) - 1;
            p[i] = m[seqLen] + 1;
            const newLen = seqLen + 1;
            // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
            m[newLen] = i;
            longest = Math.max(newLen, longest);
        }
        // The longest increasing subsequence of nodes (initially reversed)
        const lis = [];
        // The rest of the nodes, nodes that will be moved
        const toMove = [];
        let last = children.length - 1;
        for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
            lis.push(children[cur - 1]);
            for (; last >= cur; last--) {
                toMove.push(children[last]);
            }
            last--;
        }
        for (; last >= 0; last--) {
            toMove.push(children[last]);
        }
        lis.reverse();
        // We sort the nodes being moved to guarantee that their insertion order matches the claim order
        toMove.sort((a, b) => a.claim_order - b.claim_order);
        // Finally, we move the nodes
        for (let i = 0, j = 0; i < toMove.length; i++) {
            while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
                j++;
            }
            const anchor = j < lis.length ? lis[j] : null;
            target.insertBefore(toMove[i], anchor);
        }
    }
    function append(target, node) {
        if (is_hydrating) {
            init_hydrate(target);
            if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentElement !== target))) {
                target.actual_end_child = target.firstChild;
            }
            if (node !== target.actual_end_child) {
                target.insertBefore(node, target.actual_end_child);
            }
            else {
                target.actual_end_child = node.nextSibling;
            }
        }
        else if (node.parentNode !== target) {
            target.appendChild(node);
        }
    }
    function insert(target, node, anchor) {
        if (is_hydrating && !anchor) {
            append(target, node);
        }
        else if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
            target.insertBefore(node, anchor || null);
        }
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
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
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
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
            skip_bound: false
        };
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
                start_hydrating();
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
            end_hydrating();
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.3' }, detail)));
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
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
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
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
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

    /* src/components/Bio.svelte generated by Svelte v3.38.3 */
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
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			attr_dev(img, "class", "avatar svelte-8ru7jy");
    			if (img.src !== (img_src_value = getThumbnailSrc(/*$details*/ ctx[0].thumbnail, "standard_xlarge"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*$details*/ ctx[0].name);
    			add_location(img, file$f, 5, 2, 148);
    			attr_dev(h2, "class", "title svelte-8ru7jy");
    			add_location(h2, file$f, 10, 2, 268);
    			attr_dev(p, "class", "description svelte-8ru7jy");
    			add_location(p, file$f, 11, 2, 309);
    			attr_dev(div, "class", "bio svelte-8ru7jy");
    			add_location(div, file$f, 4, 0, 128);
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
    			if (dirty & /*$details*/ 1 && img.src !== (img_src_value = getThumbnailSrc(/*$details*/ ctx[0].thumbnail, "standard_xlarge"))) {
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
    	validate_store(details, "details");
    	component_subscribe($$self, details, $$value => $$invalidate(0, $details = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Bio", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Bio> was created with unknown prop '${key}'`);
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

    /* src/components/CloseButton.svelte generated by Svelte v3.38.3 */
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
    			t = text("Fermer");
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
    	validate_slots("CloseButton", slots, []);
    	let { class: className = "" } = $$props;
    	const dispatch = createEventDispatcher();
    	const onClose = () => dispatch("click");
    	const writable_props = ["class"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CloseButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, className = $$props.class);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		className,
    		dispatch,
    		onClose
    	});

    	$$self.$inject_state = $$props => {
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
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

    /* src/components/BookList.svelte generated by Svelte v3.38.3 */
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
    			add_location(p, file$d, 18, 2, 379);
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
    			add_location(ul, file$d, 6, 2, 138);
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
    			t1 = text(t1_value);
    			t2 = space();
    			if (img.src !== (img_src_value = getThumbnailSrc(/*item*/ ctx[1].thumbnail, "portrait_medium"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[1].title);
    			attr_dev(img, "class", "svelte-22vrl0");
    			add_location(img, file$d, 9, 8, 206);
    			attr_dev(li, "class", "svelte-22vrl0");
    			add_location(li, file$d, 8, 6, 193);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, img);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*collection*/ 1 && img.src !== (img_src_value = getThumbnailSrc(/*item*/ ctx[1].thumbnail, "portrait_medium"))) {
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
    	validate_slots("BookList", slots, []);
    	
    	let { collection } = $$props;
    	const writable_props = ["collection"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BookList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("collection" in $$props) $$invalidate(0, collection = $$props.collection);
    	};

    	$$self.$capture_state = () => ({ getThumbnailSrc, collection });

    	$$self.$inject_state = $$props => {
    		if ("collection" in $$props) $$invalidate(0, collection = $$props.collection);
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

    		if (/*collection*/ ctx[0] === undefined && !("collection" in props)) {
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

    /* src/components/Error.svelte generated by Svelte v3.38.3 */

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
    			t = text(/*message*/ ctx[0]);
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
    	validate_slots("Error", slots, []);
    	let { message } = $$props;
    	const writable_props = ["message"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Error> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("message" in $$props) $$invalidate(0, message = $$props.message);
    	};

    	$$self.$capture_state = () => ({ message });

    	$$self.$inject_state = $$props => {
    		if ("message" in $$props) $$invalidate(0, message = $$props.message);
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

    		if (/*message*/ ctx[0] === undefined && !("message" in props)) {
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

    /* src/components/Loader.svelte generated by Svelte v3.38.3 */
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
    				if (!div_intro) div_intro = create_in_transition(div, scale, {});
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
    	validate_slots("Loader", slots, []);
    	let { centered } = $$props;
    	const writable_props = ["centered"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Loader> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("centered" in $$props) $$invalidate(0, centered = $$props.centered);
    	};

    	$$self.$capture_state = () => ({ scale, centered });

    	$$self.$inject_state = $$props => {
    		if ("centered" in $$props) $$invalidate(0, centered = $$props.centered);
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

    		if (/*centered*/ ctx[0] === undefined && !("centered" in props)) {
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

    /* src/components/Collection.svelte generated by Svelte v3.38.3 */

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
    			add_location(div, file$a, 8, 0, 285);
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
    	validate_store(details, "details");
    	component_subscribe($$self, details, $$value => $$invalidate(1, $details = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Collection", slots, []);
    	let { category } = $$props;
    	const writable_props = ["category"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Collection> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("category" in $$props) $$invalidate(0, category = $$props.category);
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
    		if ("category" in $$props) $$invalidate(0, category = $$props.category);
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

    		if (/*category*/ ctx[0] === undefined && !("category" in props)) {
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

    /* src/components/Tabs.svelte generated by Svelte v3.38.3 */
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
    			t = text(t_value);
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
    			t = text(t_value);
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
    			attr_dev(div, "style", div_style_value = `width: ${/*width*/ ctx[4]}px; transform: translateX(${/*shift*/ ctx[3]}px)`);
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

    			if (dirty & /*width, shift*/ 24 && div_style_value !== (div_style_value = `width: ${/*width*/ ctx[4]}px; transform: translateX(${/*shift*/ ctx[3]}px)`)) {
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
    	validate_slots("Tabs", slots, []);
    	let { items = [] } = $$props;
    	let { current = null } = $$props;
    	const dispatch = createEventDispatcher();
    	const onClick = item => () => dispatch("change", { item });
    	let selected = null;
    	const writable_props = ["items", "current"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	function button_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			selected = $$value;
    			$$invalidate(2, selected);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("current" in $$props) $$invalidate(1, current = $$props.current);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		items,
    		current,
    		dispatch,
    		onClick,
    		selected,
    		shift,
    		width
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("current" in $$props) $$invalidate(1, current = $$props.current);
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    		if ("shift" in $$props) $$invalidate(3, shift = $$props.shift);
    		if ("width" in $$props) $$invalidate(4, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selected*/ 4) {
    			$$invalidate(3, shift = selected === null || selected === void 0
    			? void 0
    			: selected.offsetLeft);
    		}

    		if ($$self.$$.dirty & /*selected*/ 4) {
    			$$invalidate(4, width = selected === null || selected === void 0
    			? void 0
    			: selected.offsetWidth);
    		}
    	};

    	return [items, current, selected, shift, width, onClick, button_binding];
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

    /* src/components/References.svelte generated by Svelte v3.38.3 */

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
    			add_location(div, file$8, 9, 0, 287);
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
    	validate_slots("References", slots, []);
    	let current = CategoriesEnum.comics;

    	const onTabChange = ({ detail }) => {
    		$$invalidate(0, current = detail.item);
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<References> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Collection,
    		Tabs,
    		CategoriesEnum,
    		current,
    		onTabChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("current" in $$props) $$invalidate(0, current = $$props.current);
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

    /* src/components/CharacterDetails.svelte generated by Svelte v3.38.3 */
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
    			add_location(div, file$7, 12, 2, 440);
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
    				if (!div_intro) div_intro = create_in_transition(div, fly, /*flyParams*/ ctx[1]);
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
    	validate_store(details, "details");
    	component_subscribe($$self, details, $$value => $$invalidate(4, $details = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CharacterDetails", slots, []);
    	const flyParams = { y: 500, duration: 500 };
    	const close = () => $$invalidate(0, isOpen = false);
    	const onCloseAnimationEnds = () => details.set(null);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CharacterDetails> was created with unknown prop '${key}'`);
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
    		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$props.isOpen);
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

    /* src/components/Character.svelte generated by Svelte v3.38.3 */
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
    			t1 = text(t1_value);
    			attr_dev(img, "class", "avatar svelte-bvlfgv");
    			if (img.src !== (img_src_value = getThumbnailSrc(/*character*/ ctx[0].thumbnail, "standard_medium"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*character*/ ctx[0].name);
    			add_location(img, file$6, 8, 2, 260);
    			attr_dev(span, "class", "name svelte-bvlfgv");
    			add_location(span, file$6, 13, 2, 382);
    			attr_dev(button, "class", "character svelte-bvlfgv");
    			add_location(button, file$6, 7, 0, 205);
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
    			if (dirty & /*character*/ 1 && img.src !== (img_src_value = getThumbnailSrc(/*character*/ ctx[0].thumbnail, "standard_medium"))) {
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
    	validate_slots("Character", slots, []);
    	
    	let { character } = $$props;
    	const displayDetails = () => details.set(character);
    	const writable_props = ["character"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Character> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("character" in $$props) $$invalidate(0, character = $$props.character);
    	};

    	$$self.$capture_state = () => ({
    		getThumbnailSrc,
    		details,
    		character,
    		displayDetails
    	});

    	$$self.$inject_state = $$props => {
    		if ("character" in $$props) $$invalidate(0, character = $$props.character);
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

    		if (/*character*/ ctx[0] === undefined && !("character" in props)) {
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

    /* src/components/Characters.svelte generated by Svelte v3.38.3 */

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
    			add_location(li, file$5, 9, 4, 294);
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
    			add_location(ul, file$5, 7, 0, 194);
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
    				if (!ul_intro) ul_intro = create_in_transition(ul, fade, { duration: 200 });
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
    	validate_slots("Characters", slots, []);
    	
    	let { characters } = $$props;
    	const writable_props = ["characters"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Characters> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("characters" in $$props) $$invalidate(0, characters = $$props.characters);
    	};

    	$$self.$capture_state = () => ({ Character, Error: Error$1, fade, characters });

    	$$self.$inject_state = $$props => {
    		if ("characters" in $$props) $$invalidate(0, characters = $$props.characters);
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

    		if (/*characters*/ ctx[0] === undefined && !("characters" in props)) {
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

    /* src/components/Logo.svelte generated by Svelte v3.38.3 */

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
    			t0 = text("M");
    			span = element("span");
    			t1 = text("AR");
    			b0 = element("b");
    			b0.textContent = "S";
    			t3 = text("VEL");
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
    	validate_slots("Logo", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Logo> was created with unknown prop '${key}'`);
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

    /* src/components/Navigation.svelte generated by Svelte v3.38.3 */
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
    			t0 = text(/*currentPage*/ ctx[1]);
    			t1 = text(" / ");
    			t2 = text(/*numberOfPages*/ ctx[0]);
    			t3 = space();
    			button0 = element("button");
    			t4 = text("❮");
    			t5 = space();
    			button1 = element("button");
    			t6 = text("❯");
    			attr_dev(span, "class", "svelte-fq169w");
    			add_location(span, file$3, 11, 4, 407);
    			button0.disabled = /*isFirst*/ ctx[2];
    			attr_dev(button0, "class", "svelte-fq169w");
    			add_location(button0, file$3, 12, 4, 456);
    			button1.disabled = /*isLast*/ ctx[3];
    			attr_dev(button1, "class", "svelte-fq169w");
    			add_location(button1, file$3, 13, 4, 526);
    			attr_dev(nav, "class", "navigation svelte-fq169w");
    			add_location(nav, file$3, 10, 2, 341);
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

    			if (!current || dirty & /*isFirst*/ 4) {
    				prop_dev(button0, "disabled", /*isFirst*/ ctx[2]);
    			}

    			if (!current || dirty & /*isLast*/ 8) {
    				prop_dev(button1, "disabled", /*isLast*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (nav_outro) nav_outro.end(1);
    				if (!nav_intro) nav_intro = create_in_transition(nav, fade, { duration: 200 });
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
    	let if_block = /*isVisible*/ ctx[4] && create_if_block$1(ctx);

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
    			if (/*isVisible*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isVisible*/ 16) {
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
    	let $offset;
    	let $total;
    	let $details;
    	validate_store(offset, "offset");
    	component_subscribe($$self, offset, $$value => $$invalidate(5, $offset = $$value));
    	validate_store(total, "total");
    	component_subscribe($$self, total, $$value => $$invalidate(6, $total = $$value));
    	validate_store(details, "details");
    	component_subscribe($$self, details, $$value => $$invalidate(7, $details = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navigation", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navigation> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		details,
    		offset,
    		total,
    		fade,
    		isFirst,
    		$offset,
    		numberOfPages,
    		$total,
    		currentPage,
    		isLast,
    		isVisible,
    		$details
    	});

    	$$self.$inject_state = $$props => {
    		if ("isFirst" in $$props) $$invalidate(2, isFirst = $$props.isFirst);
    		if ("numberOfPages" in $$props) $$invalidate(0, numberOfPages = $$props.numberOfPages);
    		if ("currentPage" in $$props) $$invalidate(1, currentPage = $$props.currentPage);
    		if ("isLast" in $$props) $$invalidate(3, isLast = $$props.isLast);
    		if ("isVisible" in $$props) $$invalidate(4, isVisible = $$props.isVisible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$offset*/ 32) {
    			$$invalidate(2, isFirst = $offset === 0);
    		}

    		if ($$self.$$.dirty & /*$total*/ 64) {
    			$$invalidate(0, numberOfPages = Math.ceil($total / 20));
    		}

    		if ($$self.$$.dirty & /*$offset*/ 32) {
    			$$invalidate(1, currentPage = $offset / 20 + 1);
    		}

    		if ($$self.$$.dirty & /*numberOfPages, currentPage*/ 3) {
    			$$invalidate(3, isLast = numberOfPages === currentPage);
    		}

    		if ($$self.$$.dirty & /*numberOfPages, $details*/ 129) {
    			$$invalidate(4, isVisible = numberOfPages > 1 && !$details);
    		}
    	};

    	return [
    		numberOfPages,
    		currentPage,
    		isFirst,
    		isLast,
    		isVisible,
    		$offset,
    		$total,
    		$details
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

    /* src/components/Search.svelte generated by Svelte v3.38.3 */
    const file$2 = "src/components/Search.svelte";

    // (19:2) {#if query}
    function create_if_block(ctx) {
    	let closebutton;
    	let current;

    	closebutton = new CloseButton({
    			props: { class: "clear" },
    			$$inline: true
    		});

    	closebutton.$on("click", /*clear*/ ctx[3]);

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
    		source: "(19:2) {#if query}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let form;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*query*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			form = element("form");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			if (if_block) if_block.c();
    			input0.disabled = /*disabled*/ ctx[0];
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-1ttwqtk");
    			add_location(input0, file$2, 16, 2, 432);
    			input1.disabled = /*disabled*/ ctx[0];
    			attr_dev(input1, "type", "submit");
    			input1.value = "🔎";
    			attr_dev(input1, "class", "svelte-1ttwqtk");
    			add_location(input1, file$2, 17, 2, 486);
    			attr_dev(form, "class", "search svelte-1ttwqtk");
    			toggle_class(form, "disabled", /*disabled*/ ctx[0]);
    			add_location(form, file$2, 15, 0, 372);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, input0);
    			set_input_value(input0, /*query*/ ctx[1]);
    			append_dev(form, t0);
    			append_dev(form, input1);
    			append_dev(form, t1);
    			if (if_block) if_block.m(form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(form, "submit", /*onSubmit*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*disabled*/ 1) {
    				prop_dev(input0, "disabled", /*disabled*/ ctx[0]);
    			}

    			if (dirty & /*query*/ 2 && input0.value !== /*query*/ ctx[1]) {
    				set_input_value(input0, /*query*/ ctx[1]);
    			}

    			if (!current || dirty & /*disabled*/ 1) {
    				prop_dev(input1, "disabled", /*disabled*/ ctx[0]);
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

    			if (dirty & /*disabled*/ 1) {
    				toggle_class(form, "disabled", /*disabled*/ ctx[0]);
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
    	validate_slots("Search", slots, []);
    	let { disabled = false } = $$props;
    	let query = null;
    	const dispatch = createEventDispatcher();

    	const onSubmit = e => {
    		e.preventDefault();
    		dispatch("submit", { query });
    	};

    	const clear = e => {
    		$$invalidate(1, query = null);
    		onSubmit(e);
    	};

    	const writable_props = ["disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Search> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		query = this.value;
    		$$invalidate(1, query);
    	}

    	$$self.$$set = $$props => {
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		CloseButton,
    		disabled,
    		query,
    		dispatch,
    		onSubmit,
    		clear
    	});

    	$$self.$inject_state = $$props => {
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ("query" in $$props) $$invalidate(1, query = $$props.query);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [disabled, query, onSubmit, clear, input0_input_handler];
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

    /* src/components/Header.svelte generated by Svelte v3.38.3 */
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
    			props: { disabled: /*$details*/ ctx[0] },
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
    			add_location(header, file$1, 11, 0, 339);
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
    			if (dirty & /*$details*/ 1) search_changes.disabled = /*$details*/ ctx[0];
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
    	validate_store(details, "details");
    	component_subscribe($$self, details, $$value => $$invalidate(0, $details = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);

    	const onSubmit = ({ detail }) => {
    		details.set(null);
    		offset.set(0);
    		query.set(detail.query);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Logo,
    		Navigation,
    		Search,
    		details,
    		offset,
    		query,
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

    /* src/components/App.svelte generated by Svelte v3.38.3 */

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
    			add_location(main, file, 10, 0, 399);
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
    	validate_store(query, "query");
    	component_subscribe($$self, query, $$value => $$invalidate(0, $query = $$value));
    	validate_store(offset, "offset");
    	component_subscribe($$self, offset, $$value => $$invalidate(1, $offset = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
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

    const app = new App({
        target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
