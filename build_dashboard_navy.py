#!/usr/bin/env python3
"""Rebuild dashboard-new: dark navy + vibrant orange/blue active tiles (screenshot style)"""
import asyncio, json, base64
import websockets

HA_WS = "ws://192.168.1.108:8123/api/websocket"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyMjRiMmI1YmQ5NmQ0NTY3OWQyNDliZGZkYTljZTYwZCIsImlhdCI6MTc3MzU2NjU1MywiZXhwIjoyMDg4OTI2NTUzfQ.IBhJbgzQF-sSaUERsoeQ06EZAEOM3OBCyt_ezhncZHg"

# ── Palette ────────────────────────────────────────────────────────────────────
BG_PAGE   = "#0d0d1a"   # very dark navy page
BG_CARD   = "#1c1c2e"   # card default (off)
BG_ORANGE = "#7c2d12"   # active bg – lights / climate
BG_BLUE   = "#0c4a6e"   # active bg – switches / media / AC
BG_GREEN  = "#064e3b"   # active bg – presence / security

IC_ORANGE = "#fb923c"
IC_BLUE   = "#38bdf8"
IC_GREEN  = "#34d399"
IC_OFF    = "rgba(255,255,255,0.18)"


def _svg_bg(color):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="{color}"/></svg>'
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()


# ── Tile builder ───────────────────────────────────────────────────────────────
def tile(entity, name, icon=None, color="orange", on_states=None,
         state_display=None, tap="toggle", navigate=None):
    on_vals = on_states or ["on"]
    palettes = {
        "orange": (BG_ORANGE, IC_ORANGE),
        "blue":   (BG_BLUE,   IC_BLUE),
        "green":  (BG_GREEN,  IC_GREEN),
    }
    bg_on, ic_on = palettes.get(color, palettes["orange"])

    state_rules = []
    for v in on_vals:
        state_rules.append({"value": v, "styles": {
            "card": [{"background": bg_on}],
            "icon": [{"color": ic_on}],
        }})
    state_rules.append({"value": "unavailable", "styles": {
        "card": [{"opacity": "0.35"}],
    }})

    card = {
        "type": "custom:button-card",
        "entity": entity, "name": name,
        "show_state": True, "show_icon": True, "show_name": True,
        "tap_action": {"action": "navigate", "navigation_path": navigate} if navigate
                      else {"action": tap},
        "hold_action": {"action": "more-info"},
        "state": state_rules,
        "styles": {
            "card": [
                {"background": BG_CARD},
                {"border-radius": "16px"},
                {"padding": "14px 16px"},
                {"min-height": "76px"},
                {"box-shadow": "0 2px 12px rgba(0,0,0,0.5)"},
                {"transition": "background 0.3s ease"},
            ],
            "grid": [
                {"grid-template-areas": '"i n" "i s"'},
                {"grid-template-columns": "44px 1fr"},
                {"align-items": "center"},
                {"text-align": "left"},
                {"column-gap": "0"},
            ],
            "icon": [{"width": "26px"}, {"color": IC_OFF}, {"justify-self": "center"}],
            "name": [{"font-size": "14px"}, {"color": "rgba(255,255,255,0.9)"},
                     {"font-weight": "500"}, {"justify-self": "start"}, {"padding": "0"}],
            "state": [{"font-size": "12px"}, {"color": "rgba(255,255,255,0.4)"},
                      {"justify-self": "start"}, {"padding": "0"}],
        }
    }
    if icon: card["icon"] = icon
    if state_display: card["state_display"] = f"[[[ {state_display} ]]]"
    return card


# ── Stat tile (big number) ─────────────────────────────────────────────────────
def stat_tile(name, entity, icon, icon_color_js, label_js, navigate_path):
    return {
        "type": "custom:button-card", "entity": entity, "name": name, "icon": icon,
        "show_state": True, "show_name": True, "show_icon": True, "show_label": True,
        "label": f"[[[ {label_js} ]]]",
        "tap_action": {"action": "navigate", "navigation_path": navigate_path},
        "styles": {
            "card": [
                {"background": BG_CARD}, {"border-radius": "18px"},
                {"padding": "20px 22px 22px"},
                {"box-shadow": "0 2px 16px rgba(0,0,0,0.5)"},
            ],
            "grid": [
                {"grid-template-areas": '"i n" "s s" "l l"'},
                {"grid-template-columns": "36px 1fr"},
                {"row-gap": "2px"},
                {"text-align": "left"},
            ],
            "icon": [{"width": "28px"}, {"color": f"[[[ {icon_color_js} ]]]"},
                     {"justify-self": "start"}, {"align-self": "center"}],
            "name": [{"font-size": "12px"}, {"color": "rgba(255,255,255,0.45)"},
                     {"font-weight": "600"}, {"text-transform": "uppercase"},
                     {"letter-spacing": "0.07em"}, {"justify-self": "start"},
                     {"align-self": "center"}],
            "state": [{"font-size": "32px"}, {"font-weight": "700"}, {"color": "white"},
                      {"justify-self": "start"}, {"padding": "4px 0 0"}],
            "label": [{"font-size": "13px"}, {"color": "rgba(255,255,255,0.4)"},
                      {"justify-self": "start"}],
        }
    }


# ── Grid wrapper ───────────────────────────────────────────────────────────────
def room_grid(title, cards, col_span=1, columns=2):
    return {
        "type": "grid",
        "columns": columns,
        "square": False,
        "column_span": col_span,
        "title": title,
        "cards": cards,
    }


# ── Built-in thermostat card (circular dial) ───────────────────────────────────
def thermostat_card(entity):
    return {
        "type": "thermostat",
        "entity": entity,
        "name": "Thermostat",
        "card_mod": {
            "style": """
              ha-card {
                background: #1c1c2e !important;
                border-radius: 18px !important;
                box-shadow: 0 2px 16px rgba(0,0,0,0.5) !important;
              }
            """
        }
    }


# ── Clock-weather card ─────────────────────────────────────────────────────────
def clock_weather():
    return {
        "type": "custom:clock-weather-card",
        "entity": "weather.forecast_home",
        "time_format": 24,
        "show_humidity": True,
        "forecast_rows": 3,
        "card_mod": {
            "style": """
              ha-card { background: transparent !important;
                        box-shadow: none !important;
                        border: none !important; }
            """
        }
    }


# ══════════════════════════════════════════════════════════════════════════════
# HOME VIEW
# ══════════════════════════════════════════════════════════════════════════════
home_view = {
    "title": "Home",
    "path": "home",
    "type": "sections",
    "max_columns": 3,
    "sections": [

        # ── Row 1 ─────────────────────────────────────────────────────────────
        # Col 1: Clock/Weather + person tiles
        {
            "type": "grid", "columns": 1, "square": False, "column_span": 1,
            "cards": [
                clock_weather(),
                {
                    "type": "grid", "columns": 2, "square": False,
                    "cards": [
                        tile("person.dan",   "Dan",   "mdi:account", color="blue",
                             on_states=["home"],
                             state_display="states['person.dan'].state === 'home' ? 'Home' : 'Away'"),
                        tile("person.annie", "Annie", "mdi:account-heart", color="green",
                             on_states=["home"],
                             state_display="states['person.annie'].state === 'home' ? 'Home' : 'Away'"),
                        tile("binary_sensor.workday_sensor", "Workday", "mdi:briefcase",
                             color="blue", on_states=["on"]),
                        tile("sun.sun", "Daylight", "mdi:weather-sunny", color="orange",
                             on_states=["above_horizon"],
                             state_display="states['sun.sun'].attributes.elevation ? Math.round(states['sun.sun'].attributes.elevation) + '°' : ''"),
                    ]
                }
            ]
        },

        # Col 2+3: Living Room
        room_grid("Living Room", [
            tile("media_player.living_room_tv",    "Sony TV",     "mdi:television",         color="blue",
                 on_states=["on", "playing", "idle", "paused"]),
            tile("media_player.living_room_2",     "HomePod",     "mdi:speaker",             color="blue",
                 on_states=["playing", "idle", "paused"]),
            tile("light.living_room_light_bulb",   "Main Light",  "mdi:ceiling-light",      color="orange"),
            tile("light.living_room_floor_lamp",   "Floor Lamp",  "mdi:floor-lamp",          color="orange"),
            tile("light.living_room_strip_lights", "LED Strip",   "mdi:led-strip-variant",  color="orange"),
            tile("cover.living_room_blinds",       "Blinds",      "mdi:blinds",              color="blue",
                 on_states=["open"]),
        ], col_span=2, columns=3),

        # ── Row 2 ─────────────────────────────────────────────────────────────
        room_grid("Bedroom", [
            tile("light.bedroom_light", "Light",    "mdi:ceiling-light", color="orange"),
            tile("light.bedside_lamps", "Bedside",  "mdi:lamp",          color="orange"),
            tile("climate.master_trv",  "Heating",  "mdi:thermometer",   color="orange",
                 on_states=["heat", "auto", "heat_cool"]),
        ], col_span=1),

        room_grid("Office", [
            tile("switch.office_switch", "Desk Power", "mdi:power-socket-uk", color="blue"),
            tile("light.office_light",   "Light",      "mdi:ceiling-light",   color="orange"),
            tile("climate.office",       "Heating",    "mdi:thermometer",     color="orange",
                 on_states=["heat", "auto", "heat_cool"]),
        ], col_span=1),

        room_grid("Bathroom", [
            tile("light.bathroom_light", "Light",      "mdi:ceiling-light", color="orange"),
            tile("switch.towel_rail",    "Towel Rail", "mdi:radiator",      color="orange"),
        ], col_span=1),

        # ── Row 3 ─────────────────────────────────────────────────────────────
        room_grid("Annie's Bedroom", [
            tile("light.annies_bedroom_light", "Light",   "mdi:ceiling-light", color="orange"),
            tile("climate.annie_s_trv",        "Heating", "mdi:thermometer",   color="orange",
                 on_states=["heat", "auto", "heat_cool"]),
        ], col_span=1),

        room_grid("Conservatory", [
            tile("light.conservatory_lights",       "Lights", "mdi:ceiling-light", color="orange"),
            tile("binary_sensor.conservatory_door", "Door",   "mdi:door-open",     color="blue",
                 on_states=["on"], tap="more-info"),
        ], col_span=1),

        room_grid("Garden", [
            tile("light.garden_lights", "Garden Lights", "mdi:outdoor-lamp", color="orange"),
        ], col_span=1),

        # ── Row 4: Thermostat + Status Stats ──────────────────────────────────
        # Thermostat section col_span 1
        {
            "type": "grid", "columns": 1, "square": False, "column_span": 1,
            "title": "Climate",
            "cards": [thermostat_card("climate.thermostat_home")],
        },

        # Status tiles col_span 2
        room_grid("Status", [
            stat_tile(
                "Enyaq", "sensor.enyaq_battery_level",
                "mdi:car-electric",
                "entity.state > 60 ? '#34d399' : entity.state > 30 ? '#fb923c' : '#f87171'",
                "states['sensor.enyaq_range'] ? states['sensor.enyaq_range'].state + ' mi' : 'Range'",
                "/dashboard-new/cars",
            ),
            stat_tile(
                "ID.3", "sensor.id3_state_of_charge",
                "mdi:car-electric",
                "entity.state > 60 ? '#34d399' : entity.state > 30 ? '#fb923c' : '#f87171'",
                "states['sensor.id3_range'] ? states['sensor.id3_range'].state + ' mi' : 'Range'",
                "/dashboard-new/cars",
            ),
            stat_tile(
                "Electricity", "sensor.octopus_energy_electricity_current_accumulative_cost",
                "mdi:lightning-bolt",
                "'#fb923c'",
                "'Cost today'",
                "/dashboard-new/energy",
            ),
            stat_tile(
                "Gas", "sensor.octopus_energy_gas_current_accumulative_cost",
                "mdi:fire",
                "'#38bdf8'",
                "'Cost today'",
                "/dashboard-new/energy",
            ),
        ], col_span=2, columns=2),
    ]
}

# ══════════════════════════════════════════════════════════════════════════════
# ENERGY VIEW
# ══════════════════════════════════════════════════════════════════════════════
energy_view = {
    "title": "Energy",
    "path": "energy",
    "type": "sections",
    "max_columns": 3,
    "sections": [
        {
            "type": "grid", "columns": 1, "square": False, "column_span": 2,
            "title": "Octopus Rates",
            "cards": [{
                "type": "custom:octopus-energy-rates-card",
                "entity": "event.octopus_energy_electricity_current_day_rates",
                "low_rate_entity": "binary_sensor.octopus_energy_electricity_intelligent_dispatching",
                "cols": 2,
                "card_mod": {
                    "style": """
                      ha-card { background: #1c1c2e !important;
                                border-radius: 16px !important;
                                box-shadow: 0 2px 16px rgba(0,0,0,0.5) !important; }
                    """
                }
            }]
        },
        room_grid("Today", [
            stat_tile("Electricity", "sensor.octopus_energy_electricity_current_accumulative_cost",
                      "mdi:lightning-bolt", "'#fb923c'", "'Cost today'", "/dashboard-new/energy"),
            stat_tile("Gas", "sensor.octopus_energy_gas_current_accumulative_cost",
                      "mdi:fire", "'#38bdf8'", "'Cost today'", "/dashboard-new/energy"),
            stat_tile("Enyaq Charges", "sensor.octopus_energy_electricity_current_month_cost",
                      "mdi:car-electric", "'#34d399'", "'This month'", "/dashboard-new/cars"),
        ], col_span=1, columns=1),
    ]
}

# ══════════════════════════════════════════════════════════════════════════════
# CARS VIEW
# ══════════════════════════════════════════════════════════════════════════════
cars_view = {
    "title": "Cars",
    "path": "cars",
    "type": "sections",
    "max_columns": 2,
    "sections": [
        {
            "type": "grid", "columns": 1, "square": False, "column_span": 1,
            "title": "Škoda Enyaq",
            "cards": [
                {
                    "type": "custom:vehicle-status-card",
                    "entity": "sensor.enyaq_battery_level",
                    "name": "Škoda Enyaq",
                    "image": "/api/image/serve/62f93ec9d3c7b32b5aefcdd1ecc6f08b/original",
                    "show_error_state": True,
                    "entities": [
                        {"entity": "sensor.enyaq_battery_level", "name": "Battery"},
                        {"entity": "sensor.enyaq_range",         "name": "Range"},
                        {"entity": "sensor.enyaq_mileage",       "name": "Mileage"},
                        {"entity": "binary_sensor.enyaq_charging","name": "Charging"},
                    ],
                },
                tile("climate.skoda_enyaq_air_conditioning", "AC Pre-condition",
                     "mdi:air-conditioner", color="blue",
                     on_states=["cool", "heat", "heat_cool", "fan_only"]),
            ]
        },
        {
            "type": "grid", "columns": 1, "square": False, "column_span": 1,
            "title": "Volkswagen ID.3",
            "cards": [
                {
                    "type": "custom:vehicle-status-card",
                    "entity": "sensor.id3_state_of_charge",
                    "name": "Volkswagen ID.3",
                    "image": "/api/image/serve/090aa31129ebded9e73953e88960dd58/original",
                    "show_error_state": True,
                    "entities": [
                        {"entity": "sensor.id3_state_of_charge",  "name": "Battery"},
                        {"entity": "sensor.id3_range",            "name": "Range"},
                        {"entity": "sensor.id3_mileage",          "name": "Mileage"},
                        {"entity": "binary_sensor.id3_charging_state", "name": "Charging"},
                    ],
                },
                tile("climate.id3_electric_climatisation", "AC Pre-condition",
                     "mdi:air-conditioner", color="blue",
                     on_states=["cool", "heat", "heat_cool", "fan_only"]),
            ]
        },
    ]
}

# ══════════════════════════════════════════════════════════════════════════════
# DASHBOARD
# ══════════════════════════════════════════════════════════════════════════════
DASHBOARD = {
    "views": [home_view, energy_view, cars_view],
    "background_color": BG_PAGE,
}


async def save():
    async with websockets.connect(HA_WS) as ws:
        await ws.recv()
        await ws.send(json.dumps({"type": "auth", "access_token": TOKEN}))
        r = json.loads(await ws.recv())
        assert r["type"] == "auth_ok", r

        await ws.send(json.dumps({
            "id": 1,
            "type": "lovelace/config/save",
            "url_path": "dashboard-new",
            "config": DASHBOARD,
        }))
        r = json.loads(await ws.recv())
        print("Saved:", r.get("success"), r.get("error", ""))

asyncio.run(save())
