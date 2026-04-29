import { NextResponse } from 'next/server';
import { getPricingMap } from '@/lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    const pricing = getPricingMap();
    
    let total = 0;
    const breakdown = [];

    const addCost = (key, customLabel) => {
      if (key && pricing[key] !== undefined) {
        total += pricing[key];
        breakdown.push({ key, label: customLabel || key, cost: pricing[key] });
      }
    };

    // Calculate core selections
    addCost(data.setup, 'Bathroom Set Up');
    addCost(data.tiles, 'Shower Area Tiles');
    addCost(data.glass, 'Shower Glass Door');
    addCost(data.floor, 'Bathroom Floor');
    addCost(data.paint, 'Paint');
    addCost(data.vanity, 'Vanity');

    // Calculate Misc
    if (data.misc) {
      if (data.misc.led_lights_count > 0) {
        const unitCost = pricing['misc_led_light_per_unit'] || 0;
        const lightsTotal = unitCost * data.misc.led_lights_count;
        total += lightsTotal;
        breakdown.push({ key: 'led_lights', label: `LED Lights (${data.misc.led_lights_count}x)`, cost: lightsTotal });
      }
      if (data.misc.replace_exhaust_fan) addCost('misc_replace_exhaust_fan', 'Replace exhaust fan');
      if (data.misc.new_exhaust_fan_vent) addCost('misc_new_exhaust_fan_vent', 'New exhaust fan with vent');
      if (data.misc.raise_light_fixture) addCost('misc_raise_light_fixture', 'Raise light fixture');
      if (data.misc.run_electrical_led_mirror) addCost('misc_run_electrical_led_mirror', 'Electrical for LED mirror');
    }

    // You could also save the lead info here to a database if needed.
    
    return NextResponse.json({ total, breakdown });
  } catch (error) {
    console.error('Estimate error:', error);
    return NextResponse.json({ error: 'Failed to calculate estimate' }, { status: 500 });
  }
}
