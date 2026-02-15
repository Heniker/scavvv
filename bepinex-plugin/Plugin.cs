using BepInEx;
using BepInEx.Logging;

using System.Collections.Generic;
using System;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using BepInEx;
using BepInEx.Logging;
using Newtonsoft.Json;
using System.Runtime.Serialization;

using UnityEngine;
using Newtonsoft.Json.Serialization;
using System.Linq;
using System.Collections.ObjectModel;
using System.Runtime.InteropServices;
using Newtonsoft.Json.Linq;

namespace MyFirstPlugin;

[BepInPlugin(MyPluginInfo.PLUGIN_GUID, MyPluginInfo.PLUGIN_NAME, MyPluginInfo.PLUGIN_VERSION)]
public class Plugin : BaseUnityPlugin
{
  internal static new ManualLogSource Logger;

  private void Awake()
  {

    // Plugin startup logic
    Logger = base.Logger;

    Logger.LogInfo("1");

    // Set as global default (once at app startup)
    JsonConvert.DefaultSettings = () => new JsonSerializerSettings
    {
      ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
      DefaultValueHandling = DefaultValueHandling.Ignore,
      NullValueHandling = NullValueHandling.Ignore,
      ContractResolver = new DefaultContractResolver
      {
        SerializeCompilerGeneratedMembers = false
      }
    };

    Item.SetupItems();
    Recipes.SetUpRecipes();

    var serializableRecipes = new Collection<object>();
    foreach (Recipe it in Recipes.recipes)
    {
      var ffs = new { it.category, it.description, it.fullName, it.index, it.INT, it.isRepair, it.items, it.result };
      serializableRecipes.Add(ffs);
    }

    var serializableLiquids = new Collection<object>();
    foreach (var it in Liquids.Registry)
    {
      var k = it.Key;
      var v = it.Value;

      var color = new { r = v.color.r, g = v.color.g, b = v.color.b };

      var ffs = new { v.localeName, color, v.valuePerLiter, v.injectable, v.injectionSickness, v.healthUsable, v.localeFromItem, v.qualities };
      serializableLiquids.Add(ffs);
    }

    var serializableItems = new Dictionary<string, object>();
    foreach (var it in Item.GlobalItems)
    {
      var k = it.Key;
      var v = it.Value;

      LiquidItemInfo liq = null;
      if (v is LiquidItemInfo liquid)
      {
        liq = liquid;
      }

      var ffs = new
      {
        liq?.capacity,
        liq?.autoFill,
        liq?.defaultContents,

        v.rotSpeed,
        v.slotRotation,

        v.autoAttack,
        v.category,
        v.combineable,
        v.decayInfo,
        v.decayMinutes,
        v.description,
        v.desiredWearLimb,
        v.destroyAtZeroCondition,
        v.fullName,
        v.ignoreDepression,
        v.jumpHeightMultChange,
        v.onlyHoldInHands,
        v.qualities,
        rec = new { v.rec.min },
        v.scaleWeightWithCondition,
        v.tags,
        v.usable,
        v.usableOnLimb,
        v.usableWithLMB,
        v.value,
        v.wearable,
        v.wearableArmor,
        v.wearableHitDurabilityLossMultiplier,
        v.wearableIsolation,
        v.wearableVisualOffset,
        v.wearSlotId,
        v.weight
      };

      serializableItems.Add(k, ffs);
    }
    // var c = JsonConvert.SerializeObject(tmp);


    // var a = JsonConvert.SerializeObject(Item.GlobalItems);
    // Recipes.SetUpRecipes();
    // var c = JsonConvert.SerializeObject(Recipes.recipes);

    // Logger.LogInfo("c:");

    // File.Create(@"E:\_my\code\scav-test\bepinextest\items.json");
    File.WriteAllText(@"C:\\temp\\recipes.json", JsonConvert.SerializeObject(serializableRecipes));
    File.WriteAllText(@"C:\\temp\\liquids.json", JsonConvert.SerializeObject(serializableLiquids));
    File.WriteAllText(@"C:\\temp\\items.json", JsonConvert.SerializeObject(serializableItems));

    Logger.LogInfo($"Plugin {MyPluginInfo.PLUGIN_GUID} is loaded!");

  }
}
